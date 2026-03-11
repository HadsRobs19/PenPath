import Button from '../components/Button'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { FaUser } from 'react-icons/fa'
import { supabase } from "../lib/Client"
import "../App.css"
import logo from "../assets/logo.png"

const PWReset = () => {

  const navigate = useNavigate()

  const [email,setEmail] = useState("")
  const [loading,setLoading] = useState(false)
  const [error,setError] = useState(null)

  async function handleSubmit(e){
    e.preventDefault()

    setLoading(true)
    setError(null)

    try{
      const { error } = await supabase.auth.resetPasswordForEmail(email,{
        redirectTo:"http://localhost:5173/reset-password"
      })

      if(error) throw error

      navigate("/pw-reset-confirm")

    }catch(err){

      setError(err.message)

    }finally{

      setLoading(false)

    }

  }

  return (
    <div className="app-bg">
      <div className="login-content">
        <div className="pw-reset-logo">
          <img src={logo} alt="Pen Path logo" className="logo"/>
        </div>

        <h1 className="login-heading">Reset Password</h1>

        <form onSubmit={handleSubmit} className="login-form">

          <div className="input-group">
            <FaUser className="input-icon"/>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
              required
            />
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? "Sending reset email..." : "Send Reset Link"}
          </Button>

          {error && <p>{error}</p>}
        </form>
      </div>
    </div>
  )
}

export default PWReset