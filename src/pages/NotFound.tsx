import { Link } from "react-router-dom"; import Layout from "../components/Layout";
export default function NotFound(){return <Layout><section className="section"><div className="container narrow center"><span className="eyebrow">404</span><h1>Page not found</h1><p>The page you requested does not exist.</p><Link className="button" to="/">Go home</Link></div></section></Layout>}
