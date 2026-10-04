import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { CalendarPlus, Check, CircleDollarSign, LogOut, MessageSquare, RefreshCw, Settings2, Stethoscope, UserRoundCog, X } from "lucide-react";
import Layout from "../components/Layout";
import Loading from "../components/Loading";
import { useAuth } from "../context/AuthContext";
import { getPaymentSettings } from "../services/bookingService";
import {
  createSlot,
  getAdminBookings,
  getAllPractitioners,
  getAllServices,
  getInquiries,
  getUpcomingSlots,
  markInquiryReviewed,
  removeSlot,
  savePaymentSettings,
  savePractitioner,
  saveService,
  setBookingState,
} from "../services/adminService";
import type { Booking, Inquiry, PaymentSettings, Practitioner, Service, Slot } from "../types";
import { formatDateTime, formatMoney } from "../lib/utils";

type Tab="bookings"|"services"|"practitioners"|"slots"|"messages"|"payment";
const emptyService:Omit<Service,"id">={name:"",description:"",duration:60,price:0,currency:"INR",isActive:true,displayOrder:10};
const emptyPractitioner:Omit<Practitioner,"id">={name:"",designation:"",bio:"",isActive:true};
const emptyPayment:PaymentSettings={enabled:false,upiId:"",payeeName:"",qrImageUrl:"",instructions:""};

export default function AdminDashboard(){
  const {isAdmin,loading:authLoading,logoutAdmin}=useAuth();
  const [tab,setTab]=useState<Tab>("bookings"); const [loading,setLoading]=useState(true); const [error,setError]=useState("");
  const [bookings,setBookings]=useState<Booking[]>([]); const [services,setServices]=useState<Service[]>([]); const [practitioners,setPractitioners]=useState<Practitioner[]>([]); const [slots,setSlots]=useState<Slot[]>([]); const [messages,setMessages]=useState<Inquiry[]>([]); const [payment,setPayment]=useState<PaymentSettings>(emptyPayment);
  const [serviceForm,setServiceForm]=useState<Omit<Service,"id">>(emptyService); const [serviceEditId,setServiceEditId]=useState<string|undefined>();
  const [practitionerForm,setPractitionerForm]=useState<Omit<Practitioner,"id">>(emptyPractitioner); const [practitionerEditId,setPractitionerEditId]=useState<string|undefined>();
  const [slotForm,setSlotForm]=useState({serviceId:"",practitionerId:"",startLocal:""});

  async function refresh(){setLoading(true);setError("");try{const [b,s,p,sl,m,pay]=await Promise.all([getAdminBookings(),getAllServices(),getAllPractitioners(),getUpcomingSlots(),getInquiries(),getPaymentSettings()]);setBookings(b);setServices(s);setPractitioners(p);setSlots(sl);setMessages(m);setPayment(pay);if(!slotForm.serviceId&&s[0])setSlotForm(v=>({...v,serviceId:s[0].id}));if(!slotForm.practitionerId&&p[0])setSlotForm(v=>({...v,practitionerId:p[0].id}));}catch(err){setError(err instanceof Error?err.message:"Unable to load admin data.");}finally{setLoading(false);}}
  useEffect(()=>{if(isAdmin)refresh();},[isAdmin]);
  const serviceMap=useMemo(()=>Object.fromEntries(services.map(s=>[s.id,s])),[services]); const practitionerMap=useMemo(()=>Object.fromEntries(practitioners.map(p=>[p.id,p])),[practitioners]);
  if(authLoading)return <Layout><section className="section"><Loading/></section></Layout>;
  if(!isAdmin)return <Navigate to="/admin/login" replace/>;

  async function changeBooking(id:string,status?:Booking["status"],paymentStatus?:Booking["paymentStatus"]){try{await setBookingState(id,status,paymentStatus);await refresh();}catch(err){setError(err instanceof Error?err.message:"Update failed.");}}
  async function submitService(e:React.FormEvent){e.preventDefault();await saveService(serviceForm,serviceEditId);setServiceForm(emptyService);setServiceEditId(undefined);await refresh();}
  async function submitPractitioner(e:React.FormEvent){e.preventDefault();await savePractitioner(practitionerForm,practitionerEditId);setPractitionerForm(emptyPractitioner);setPractitionerEditId(undefined);await refresh();}
  async function submitSlot(e:React.FormEvent){e.preventDefault();const s=serviceMap[slotForm.serviceId],p=practitionerMap[slotForm.practitionerId];if(!s||!p)return;await createSlot(s,p,slotForm.startLocal);setSlotForm(v=>({...v,startLocal:""}));await refresh();}
  async function submitPayment(e:React.FormEvent){e.preventDefault();await savePaymentSettings(payment);await refresh();}

  const tabs:[Tab,string,React.ReactNode][]=[["bookings","Bookings",<Stethoscope/>],["services","Services",<Settings2/>],["practitioners","Practitioners",<UserRoundCog/>],["slots","Slots",<CalendarPlus/>],["messages","Messages",<MessageSquare/>],["payment","Payment",<CircleDollarSign/>]];
  return <Layout><section className="admin-shell"><div className="container admin-head"><div><span className="eyebrow">Admin</span><h1>Homoeopathy practice dashboard</h1></div><div className="admin-actions"><button className="button secondary" onClick={refresh}><RefreshCw size={16}/> Refresh</button><button className="button secondary" onClick={logoutAdmin}><LogOut size={16}/> Logout</button></div></div>
  <div className="container admin-tabs">{tabs.map(([key,label,icon])=><button key={key} onClick={()=>setTab(key)} className={tab===key?"active":""}>{icon}{label}</button>)}</div>
  <div className="container admin-content">{error&&<div className="form-error">{error}</div>}{loading?<Loading label="Loading practice data…"/>:<>
    {tab==="bookings"&&<div className="stack"><div className="section-row"><h2>Bookings</h2><span>{bookings.length} total</span></div>{bookings.length===0?<div className="empty">No bookings yet.</div>:bookings.map(b=><article className="admin-card" key={b.id}><div className="admin-card-main"><div><span className="booking-ref">{b.id}</span><h3>{b.userName}</h3><p>{b.serviceName} · {b.practitionerName}</p><p>{formatDateTime(b.appointmentStart)} · {formatMoney(b.amount,b.currency)}</p><p className="muted">{b.userEmail} · {b.userPhone}</p><p className="concern">{b.concern}</p></div><div className="status-column"><span className={`status ${b.status}`}>{b.status}</span><span className={`status ${b.paymentStatus}`}>payment: {b.paymentStatus}</span>{b.paymentReference&&<small>Ref: {b.paymentReference}</small>}{b.paymentProofUrl&&<a href={b.paymentProofUrl} target="_blank" rel="noreferrer">View payment proof</a>}</div></div><div className="row-actions"><button onClick={()=>changeBooking(b.id,undefined,"verified")}><Check/>Verify payment</button><button onClick={()=>changeBooking(b.id,undefined,"rejected")}><X/>Reject payment</button><button onClick={()=>changeBooking(b.id,"confirmed")}>Confirm</button><button onClick={()=>changeBooking(b.id,"completed")}>Complete</button><button onClick={()=>changeBooking(b.id,"cancelled")}>Cancel</button></div></article>)}</div>}

    {tab==="services"&&<div className="admin-two"><form className="glass-card form-card" onSubmit={submitService}><h2>{serviceEditId?"Edit":"Add"} service</h2><label>Name<input required value={serviceForm.name} onChange={e=>setServiceForm({...serviceForm,name:e.target.value})}/></label><label>Description<textarea required rows={4} value={serviceForm.description} onChange={e=>setServiceForm({...serviceForm,description:e.target.value})}/></label><div className="form-grid"><label>Duration (min)<input type="number" min="10" required value={serviceForm.duration} onChange={e=>setServiceForm({...serviceForm,duration:Number(e.target.value)})}/></label><label>Fee (₹)<input type="number" min="0" required value={serviceForm.price} onChange={e=>setServiceForm({...serviceForm,price:Number(e.target.value)})}/></label><label>Display order<input type="number" value={serviceForm.displayOrder??10} onChange={e=>setServiceForm({...serviceForm,displayOrder:Number(e.target.value)})}/></label></div><label className="check"><input type="checkbox" checked={serviceForm.isActive} onChange={e=>setServiceForm({...serviceForm,isActive:e.target.checked})}/><span>Active</span></label><button className="button">Save service</button>{serviceEditId&&<button type="button" className="button secondary" onClick={()=>{setServiceEditId(undefined);setServiceForm(emptyService)}}>Cancel edit</button>}</form><div className="stack">{services.map(s=><div className="admin-card compact-card" key={s.id}><div><h3>{s.name}</h3><p>{s.duration} min · {formatMoney(s.price,s.currency)} · {s.isActive?"Active":"Inactive"}</p></div><button onClick={()=>{setServiceEditId(s.id);setServiceForm({name:s.name,description:s.description,duration:s.duration,price:s.price,currency:s.currency,isActive:s.isActive,displayOrder:s.displayOrder})}}>Edit</button></div>)}</div></div>}

    {tab==="practitioners"&&<div className="admin-two"><form className="glass-card form-card" onSubmit={submitPractitioner}><h2>{practitionerEditId?"Edit":"Add"} practitioner</h2><label>Name<input required value={practitionerForm.name} onChange={e=>setPractitionerForm({...practitionerForm,name:e.target.value})}/></label><label>Designation<input required value={practitionerForm.designation} onChange={e=>setPractitionerForm({...practitionerForm,designation:e.target.value})}/></label><label>Bio<textarea rows={5} value={practitionerForm.bio} onChange={e=>setPractitionerForm({...practitionerForm,bio:e.target.value})}/></label><label className="check"><input type="checkbox" checked={practitionerForm.isActive} onChange={e=>setPractitionerForm({...practitionerForm,isActive:e.target.checked})}/><span>Active</span></label><button className="button">Save practitioner</button>{practitionerEditId&&<button type="button" className="button secondary" onClick={()=>{setPractitionerEditId(undefined);setPractitionerForm(emptyPractitioner)}}>Cancel edit</button>}</form><div className="stack">{practitioners.map(p=><div className="admin-card compact-card" key={p.id}><div><h3>{p.name}</h3><p>{p.designation} · {p.isActive?"Active":"Inactive"}</p></div><button onClick={()=>{setPractitionerEditId(p.id);setPractitionerForm({name:p.name,designation:p.designation,bio:p.bio||"",isActive:p.isActive})}}>Edit</button></div>)}</div></div>}

    {tab==="slots"&&<div className="admin-two"><form className="glass-card form-card" onSubmit={submitSlot}><h2>Create appointment slot</h2><label>Service<select required value={slotForm.serviceId} onChange={e=>setSlotForm({...slotForm,serviceId:e.target.value})}>{services.map(s=><option value={s.id} key={s.id}>{s.name}</option>)}</select></label><label>Practitioner<select required value={slotForm.practitionerId} onChange={e=>setSlotForm({...slotForm,practitionerId:e.target.value})}>{practitioners.map(p=><option value={p.id} key={p.id}>{p.name}</option>)}</select></label><label>Start date & time<input required type="datetime-local" value={slotForm.startLocal} onChange={e=>setSlotForm({...slotForm,startLocal:e.target.value})}/></label><button className="button">Create slot</button></form><div className="stack">{slots.map(s=><div className="admin-card compact-card" key={s.id}><div><h3>{serviceMap[s.serviceId]?.name||s.serviceId}</h3><p>{practitionerMap[s.practitionerId]?.name||s.practitionerId} · {formatDateTime(s.startTime)} · {s.isBooked?"Booked":"Available"}</p></div>{!s.isBooked&&<button onClick={async()=>{await removeSlot(s);await refresh()}}>Delete</button>}</div>)}</div></div>}

    {tab==="messages"&&<div className="stack"><div className="section-row"><h2>Enquiries</h2><span>{messages.filter(m=>m.status==="new").length} new</span></div>{messages.map(m=><article className="admin-card" key={m.id}><div className="admin-card-main"><div><h3>{m.name}</h3><p>{m.email} · {m.phone}</p><p>{m.message}</p><small>{formatDateTime(m.createdAt)}</small></div><div>{m.status==="new"?<button className="button secondary" onClick={async()=>{await markInquiryReviewed(m.id);await refresh()}}>Mark reviewed</button>:<span className="status completed">reviewed</span>}</div></div></article>)}</div>}

    {tab==="payment"&&<form className="glass-card form-card admin-settings" onSubmit={submitPayment}><h2>Payment settings</h2><label className="check"><input type="checkbox" checked={payment.enabled} onChange={e=>setPayment({...payment,enabled:e.target.checked})}/><span>Show online/manual payment instructions after booking</span></label><label>UPI ID<input value={payment.upiId} onChange={e=>setPayment({...payment,upiId:e.target.value})}/></label><label>Payee name<input value={payment.payeeName} onChange={e=>setPayment({...payment,payeeName:e.target.value})}/></label><label>QR image URL<input value={payment.qrImageUrl} onChange={e=>setPayment({...payment,qrImageUrl:e.target.value})} placeholder="Optional HTTPS image URL"/></label><label>Instructions<textarea rows={5} value={payment.instructions} onChange={e=>setPayment({...payment,instructions:e.target.value})}/></label><button className="button">Save payment settings</button></form>}
  </>}</div></section></Layout>;
}
