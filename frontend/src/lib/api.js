import { supabase } from "./Client"

export async function apiFetch(url, options={}){

 const session = await supabase.auth.getSession()

 const token = session.data.session?.access_token

 const response = await fetch(`http://localhost:3000${url}`,{
   ...options,
   headers:{
     "Content-Type":"application/json",
     Authorization:`Bearer ${token}`,
     ...(options.headers||{})
   }
 })

 if (!response.ok) {
   throw new Error(`API error: ${response.status}`)
 }

 return response.json()
}