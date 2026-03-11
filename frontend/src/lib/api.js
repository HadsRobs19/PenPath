import { supabase } from "./Client"

export async function apiFetch(url, options={}){

 const session = await supabase.auth.getSession()

 const token = session.data.session?.access_token

 return fetch(`http://localhost:3000${url}`,{
   ...options,
   headers:{
     "Content-Type":"application/json",
     Authorization:`Bearer ${token}`,
     ...(options.headers||{})
   }
 })

}