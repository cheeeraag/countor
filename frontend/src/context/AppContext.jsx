import { createContext,useContext,useState,useEffect } from 'react'
import { token,authAPI,checkinsAPI,privacyAPI } from '../utils/http'
const AppContext=createContext(null)
export function AppProvider({children}){
 const[user,setUser]=useState(null),[history,setHistory]=useState([]),[recommendations,setRecommendations]=useState([]),[loading,setLoading]=useState(true)
 const loadUserData=async()=>{const h=await checkinsAPI.history();setHistory(h);if(h.length){try{setRecommendations(await checkinsAPI.recommendations())}catch{setRecommendations([])}}else setRecommendations([])}
 useEffect(()=>{const restore=async()=>{if(!token.get()){setLoading(false);return}try{const{user:u}=await authAPI.me();setUser(u);if(!['org_admin_pending','rejected'].includes(u.role))await loadUserData()}catch{token.remove()}setLoading(false)};restore()},[])
 const login=async credentials=>{const res=await authAPI.login(credentials);if(res.token)token.set(res.token);setUser(res.user);if(!['org_admin_pending','rejected'].includes(res.user.role))await loadUserData();return res}
 const signup=async formData=>{const res=await authAPI.signup(formData);if(res.token)token.set(res.token);if(res.user)setUser(res.user);setHistory([]);setRecommendations([]);return res}
 const logout=()=>{token.remove();setUser(null);setHistory([]);setRecommendations([])}
 const saveCheckin=async result=>{const entry=await checkinsAPI.save(result);const h=await checkinsAPI.history();setHistory(h);try{setRecommendations(await checkinsAPI.recommendations())}catch{setRecommendations(entry?.recommendations||[])}return entry}
 const updateDirectoryPrivacy=async directoryVisible=>{const res=await privacyAPI.update(directoryVisible);setUser(u=>u?{...u,directoryVisible:res.directoryVisible}:u);return res}
 const isSuperAdmin=user?.role==='superadmin',isOrgAdmin=user?.role==='org_admin',isAdmin=isSuperAdmin||isOrgAdmin,isPending=user?.role==='org_admin_pending',isRejected=user?.role==='rejected'
 return <AppContext.Provider value={{user,history,recommendations,loading,login,signup,logout,saveCheckin,updateDirectoryPrivacy,isSuperAdmin,isOrgAdmin,isAdmin,isPending,isRejected}}>{children}</AppContext.Provider>
}
export const useApp=()=>{const ctx=useContext(AppContext);if(!ctx)throw new Error('useApp must be inside AppProvider');return ctx}
