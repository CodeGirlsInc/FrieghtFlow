import { fetchApi } from "@/services/api"
import { useQuery } from "@tanstack/react-query"

export const useShipments=()=>{
    return useQuery({
        queryKey:["shipments"],
        queryFn:()=>fetchApi("/api/shipments"),
    })
}