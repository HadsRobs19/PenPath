import Button from '../components/Button'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { FaKey } from 'react-icons/fa'
import { supabase } from "../lib/Client"
import "../App.css"
import logo from "../assets/logo.png"

const PWResetConfirm = () => {

  const navigate = useNavigate()

  const [newPassword,setNewPassword] = useState("")
  const [confirmNewPassword,setConfirmNewPassword] = useState("")
  const [loading,setLoading] = useState(false)
  const [error,setError] = useState(null)

  async function handleSubmit(e){

    e.preventDefault()

    if(newPassword !== confirmNewPassword){
      setError("Passwords do not match")
      return
    }

    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.updateUser({
      password:newPassword
    })

    if(error){
      setError(error.message)
      setLoading(false)
      return
    }

    navigate("/login")

  }

  return (
    <div className="app-bg">

      <div className="login-content">

        <div className="confirm-pw-logo">
          <img src={logo} alt="Pen Path logo" className="logo"/>
        </div>

        <h1 className="login-heading">Create New Password</h1>

        <form onSubmit={handleSubmit} className="login-form">

          <div className="input-group">
            <FaKey className="input-icon"/>
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e)=>setNewPassword(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <FaKey className="input-icon"/>
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmNewPassword}
              onChange={(e)=>setConfirmNewPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? "Updating password..." : "Update Password"}
          </Button>

          {error && <p>{error}</p>}

        </form>

      </div>

    </div>
  )
}

export default PWResetConfirm