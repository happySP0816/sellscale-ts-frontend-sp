import { useRecoilValue } from 'recoil'
import { userTokenState } from "@atoms/userAtoms"

export default function TAMGraph () {
    const userToken = useRecoilValue(userTokenState)
    
    return (
      <iframe
        title="TAM Graph"
        width="100%"
        height="100%"
        src={`https://sellscale.retool.com/apps/25107d88-9099-11ee-9a56-f36fbd4c0f30/TAM Graph - Experiment#authToken=${userToken}`}
        >
       </iframe>
  )
  
}