import React from 'react'
import assets from '../assets/assets'
import Title from './Title'
import ServiceCard from './ServiceCard'

const Aboutus = () => {

    const servicesData = [
        {
            title:'Train',
            description: '64444 images',
            icon: assets.ads_icon,
        },
        {
            title:'Validation',
            description: '8038 images',
            icon: assets.marketing_icon,
        },
        {
            title:'Test',
            description: '52 images',
            icon: assets.content_icon,
        },
        {
            title:'Dataset',
            description: '65 Classes',
            icon: assets.ads_icon,
        },
    ]
  return (
    <div id='AboutUs' className='flex flex-col items-center gap-7 px-4 sm:px-12 lg:px-24 xl:px-40 pt-30 text-text bg-(--color-hero)'>
      <img src={assets.bgImage2} alt="" className='absolute -top-110 -left-70 -z-1 dark:hidden'/>
      <p className='text-3xl mx-auto text-center'>Model development</p>
      <p className='text-sm sm:text-lg font-medium text-text sm:w-250  pb-3 mx-auto text-center'>The process begins with 
image acquisition, where leaf images are collected from publicly available datasets or real-time 
field conditions. The images undergo preprocessing steps such as resizing, normalization, 
noise reduction, and data augmentation to improve model generalization and robustness. 
Feature extraction and classification are performed automatically by the deep learning model</p>
      
      <div className='flex flex-col md:grid grid-cols-2 '>
        {servicesData.map((service, index)=>(
            <ServiceCard  key={index} service={service} index={index}/>
        ))}
      </div>
    </div>
  )
}

export default Aboutus

