import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext(undefined)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Depende de user?.id, no de `user`: onAuthStateChange emite un objeto
  // `user` nuevo (misma identidad, distinta referencia) en cada
  // TOKEN_REFRESHED periódico. Si dependiéramos del objeto completo,
  // recargaríamos el perfil de Supabase en cada refresh de token sin
  // necesidad.
  useEffect(() => {
    if (!user) {
      setProfile(null)
      return
    }

    let cancelado = false
    const cargarPerfil = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('avatar_id, display_name')
        .eq('id', user.id)
        .single()

      if (cancelado) return
      if (!error) setProfile(data)
    }

    cargarPerfil()
    return () => {
      cancelado = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  const refreshProfile = async () => {
    if (!user) return
    const { data, error } = await supabase
      .from('profiles')
      .select('avatar_id, display_name')
      .eq('id', user.id)
      .single()
    if (!error) setProfile(data)
  }

  const signOut = () => supabase.auth.signOut()

  return (
    <AuthContext.Provider value={{ user, session, loading, profile, refreshProfile, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider')
  }
  return context
}
