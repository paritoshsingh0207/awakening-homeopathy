import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInAnonymously,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

type Role = "admin" | "user";

interface AuthState {
  user: User | null;
  role: Role;
  loading: boolean;
  isAdmin: boolean;
  loginAdmin: (email: string, password: string) => Promise<void>;
  logoutAdmin: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role>("user");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      if (!nextUser) {
        try {
          await signInAnonymously(auth);
        } catch (error) {
          console.error("Anonymous sign-in failed", error);
          setLoading(false);
        }
        return;
      }

      setUser(nextUser);
      try {
        const userDoc = await getDoc(doc(db, "users", nextUser.uid));
        setRole(userDoc.exists() && userDoc.data().role === "admin" ? "admin" : "user");
      } catch {
        setRole("user");
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const loginAdmin = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, "users", credential.user.uid));
      if (!userDoc.exists() || userDoc.data().role !== "admin") {
        await signOut(auth);
        throw new Error("This account is not configured as an administrator.");
      }
      setUser(credential.user);
      setRole("admin");
    } finally {
      setLoading(false);
    }
  }, []);

  const logoutAdmin = useCallback(async () => {
    setLoading(true);
    await signOut(auth);
    await signInAnonymously(auth);
  }, []);

  const value = useMemo<AuthState>(
    () => ({ user, role, loading, isAdmin: role === "admin", loginAdmin, logoutAdmin }),
    [user, role, loading, loginAdmin, logoutAdmin]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used within AuthProvider");
  return value;
}
