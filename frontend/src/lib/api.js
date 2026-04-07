import { supabase } from "./Client"

// Use environment variable for API URL, fallback to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000"

export async function apiFetch(url, options={}){

 const { data, error } = await supabase.auth.getSession()

 if (error) {
   throw new Error("Failed to get session: " + error.message)
 }

 const token = data?.session?.access_token

 if (!token) {
   throw new Error("Not authenticated - please log in")
 }

 const response = await fetch(`${API_BASE_URL}${url}`,{
   ...options,
   headers:{
     "Content-Type":"application/json",
     Authorization:`Bearer ${token}`,
     ...(options.headers||{})
   }
 })

 if (!response.ok) {
   // Try to parse error response for better error messages
   let errorMessage = `API error: ${response.status}`
   try {
     const errorData = await response.json()
     if (errorData.message) {
       errorMessage = errorData.message
     }
   } catch {
     // Ignore JSON parse errors, use default message
   }
   throw new Error(errorMessage)
 }

 return response.json()
}