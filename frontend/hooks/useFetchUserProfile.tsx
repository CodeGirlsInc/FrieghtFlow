import { fetchApi } from "@/services/api"
import { useQuery } from "@tanstack/react-query"


export const useFetchUserProfile=(userId:string)=>{
    return useQuery({
        queryKey:["userProfile",userId],
        queryFn:()=>fetchApi(`/users/${userId}`),
        enabled: Boolean(userId)
    })
}