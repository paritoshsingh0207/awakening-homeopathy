import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { LockKeyhole } from "lucide-react";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";

export default function AdminLogin(){
  const {loginAdmin,isAdmin,loading}=useAuth(); const navigate=useNavigate(); const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [error,setError]=useState("");
  if(isAdmin)return <Navigate to="/admin" replace/>;
  async function submit(e:React.FormEvent){e.preventDefault();setError("");try{await loginAdmin(email,password);navigate("/admin");}catch(err){setError(err instanceof Error?err.message:"Login failed.");}}
  return <Layout><section className="section admin-login-section"><form className="glass-card form-card admin-login" onSubmit={submit}><LockKeyhole size={36}/><h1>Administrator login</h1><p>Use the Firebase Authentication account that is marked with role <code>admin</code> in Firestore.</p><label>Email<input type="email" required value={email} onChange={e=>setEmail(e.target.value)}/></label><label>Password<input type="password" required value={password} onChange={e=>setPassword(e.target.value)}/></label>{error&&<div className="form-error">{error}</div>}<button className="button" disabled={loading}>{loading?"Signing in…":"Sign in"}</button></form></section></Layout>;
}
