import { useRecoilValue } from 'recoil'
import { userTokenState } from "@atoms/userAtoms"

export default function TAMGraph () {
    const userToken = useRecoilValue(userTokenState)
    
    return (
      <iframe
        title="TAM Graph"
        width="100%"
        height="100%"
        src={`https://sellscale.retool.com/embedded/public/87e00bae-34e7-4c62-a205-c93d2a09b62f#authToken=${userToken}`}
        >
       </iframe>
  )
  
}
