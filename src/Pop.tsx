import React, { useEffect, useState } from "react";
import './App.css'



const Pop = () => {
    const [active, setActive] = useState(false)
    const [tabExist, setTabExist] = useState(false)

    useEffect(()=>{
       
    
       chrome.tabs.query({ url: 'https://1xbet.com/en/allgamesentrance/crash/*' }, (tabs: any[]) => {
        console.log(tabs)
      if (tabs.length > 0) {
      setTabExist(true)
      }else{
        setTabExist(false)
      }
    });

    const handleMessage = (request:any, sender:any, sendResponse:any) => {
        console.log(request)
      };
  
      
    },[])

    

const startTimer = ()=>{
    chrome.runtime.sendMessage(['TIMER_START'])

}

const stopTimer = ()=>{
    chrome.runtime.sendMessage(['TIMER_END'])
}

    return (
        <div className="App">
            <h2>1xBet Autobot - Crash game</h2>
            <p>Version - v1.0.0</p>
            <p>created by Shehandezen</p>
           {tabExist ? ( <div className="buttons">
                <button style={{ background: '#002B72' }} onClick={()=>{startTimer()}} disabled={active}>Start Autobot</button>
                <button style={{ background: '#dc3545' }} onClick={()=>{stopTimer()}} disabled={active}>Stop Autobot</button>
            </div>): (
                <p> Please, open <a href="https://1xbet.com/en/allgamesentrance/crash" target="_blank">1xbet crash game</a>  to start the war ☻ </p>
            )}

        </div>
    )
}

export default Pop