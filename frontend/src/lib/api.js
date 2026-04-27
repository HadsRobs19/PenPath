import { supabase } from "./Client"

// Use environment variable for API URL, or dynamically use the same host with port 3000
// This allows the app to work on Docker/Pi when accessed from other devices on the network
function getApiBaseUrl() {
  const envUrl = import.meta.env.VITE_API_URL
  if (envUrl && envUrl !== "auto") {
    return envUrl
  }
  // Auto-detect: use the same hostname as the current page but with port 3000
  // This works when frontend is on :5173 and backend is on :3000 of the same host
  if (typeof window !== "undefined") {
    const { protocol, hostname } = window.location
    return `${protocol}//${hostname}:3000`
  }
  return "http://localhost:3000"
}

const API_BASE_URL = getApiBaseUrl()

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