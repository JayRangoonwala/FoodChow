import React, { useState } from 'react'
import UserLoginModal from './User-Login'

const Sample = ({Open}:{Open:boolean}) => {
    const [isOpen,setIsOpen] = useState(false);
  return (
    <div>
      <UserLoginModal 
        open={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </div>
  )
}

export default Sample
