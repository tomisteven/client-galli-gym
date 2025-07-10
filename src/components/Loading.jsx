import React from 'react'
import loader from '../assets/loader.png'
import '../styles/Loading.css'

export default function Loading() {
  return (
    <div className='loader'>
        <img src={loader} alt="" />
    </div>
  )
}
