import React, { useEffect, useRef, useState } from 'react';
import './App.css'
import { Chart, Line, Chart as reactChart } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LinearScale,
  CategoryScale,
  BarElement,
  PointElement,
  LineElement,
  Legend,
  Tooltip,
  LineController,
  BarController,
  Filler
} from 'chart.js'
import annotationPlugin from "chartjs-plugin-annotation";
import zoomPlugin from 'chartjs-plugin-zoom';
// import {logo} from './logo.png'
import { BaseChartComponent } from 'react-chartjs-2/dist/types';

ChartJS.register(
  LinearScale,
  CategoryScale,
  BarElement,
  PointElement,
  LineElement,
  Legend,
  Tooltip,
  LineController,
  BarController,
  Filler,
  annotationPlugin,
  zoomPlugin
)

const logo =  'require("./logo.png") '



function App() {

  const chartRef = useRef<ChartJS<'line'>>(null)
  const [isPaused, setPause] = useState(false);
  const [rounds, setRounds] = useState('')
  const [days, setDays] = useState('')
  const [hours, setHours] = useState('')
  const [crashPoint, setCrashPoint] = useState('')
  const [crash, setCrash] = useState<Number[]>([])
  const [label, setLabel] = useState<String[]>([])
  const [bets, setBets] = useState<String[]>([])
  const [message, setMessage] = useState<string>('');
  const [chartData, setChartData] = useState<Object | any>({
    labels: [],
    datasets: [
      {
        label: 'Crash point',
        data: [],
        fill: true,
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        tension: 0.1
      },

    ]
  });

  const [options, setOptions] = useState<Object>({
    // animation,
    animation: {
      duration: 2000, // Animation duration in milliseconds
    },
    responsive: true,
    actions: [
      {
        name: 'Reset zoom',
        handler: function (chart: any) {
          chart.resetZoom();
        }
      }
    ],
    plugins: {
      legend: {
        position: 'top',
      },
      reverse: true,
      title: {
        display: true,
        text: 'Crash Game - 1xbet',
      },
      zoom: {
        limits: {
          x: { min: 0, minRange: 1 },
          y: { min: 0, minRange: 0.01 }
        },
        pan: {
          enabled: true,
          mode: 'xy',
          modifierKey: 'ctrl',
          scaleMode: 'xy',
          overScaleMode: 'xy',
          threshold: 10
        },
        zoom: {
          wheel: {
            enabled: true,
          },

          pinch: {
            enabled: true
          },
          drag: {
            enabled: true,
            modifierKey: 'alt',
          },
          mode: 'xy',
          limits: {
            y: { min: 0, max: 100 },
          },
        }
      },
      annotation: {
        annotations: [
          {
            type: 'line',
            yMin: 1.02,
            yMax: 1.02,
            borderColor: 'rgb(255, 99, 132)',
            borderWidth: 2,
          },
          {
            type: 'box',
            xMin: 0,
            yMin: 0,
            yMax: 1.02,
            backgroundColor: 'rgba(255, 99, 132, 0.25)',
            borderWidth: 0
          },
          {
            type: 'box',
            xMin: 0,
            yMin: 1.02,
            yMax: 1.5,
            backgroundColor: 'rgba(243, 207, 7, 0.25)',
            borderWidth: 0

          },
          {
            type: 'box',
            xMin: 0,
            yMin: 1.5,
            backgroundColor: 'rgba(97, 243, 7, 0.25)',
            borderWidth: 0
          }

        ]
      }
    },
  });

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Message received from Service Worker:', message);

    // Respond back to the service worker if needed
    sendResponse({ response: "Message received" });

    // Handle the message (e.g., update the DOM)
   
});


  const ws = useRef<WebSocket | null>(null);
  useEffect(() => {
    ws.current = new WebSocket("ws://localhost:8080");
    ws.current.onopen = () => console.log("ws opened");
    ws.current.onclose = () => console.log("ws closed");

    const wsCurrent = ws.current;
    return () => {
      wsCurrent.close();
    };
  }, [])
 


  useEffect(() => {

    if (!ws.current) return;
    if (ws.current) {
      ws.current.onmessage = async (e) => {
        const dataArray = await JSON.parse(e.data)
        console.log(dataArray)

        if (dataArray[0] == 'INITIAL_CRASH') {
          for await (let i of dataArray[1]) {
            if (i.timestamp == '-') {
              continue
            }
            setChartData((prevChartData: any) => ({
              labels: [...prevChartData.labels, i.timestamp],
              datasets: [
                {
                  ...prevChartData.datasets[0],
                  data: [...prevChartData.datasets[0].data, parseFloat(i.crash_point)]
                }
              ]
            }));
            setCrash((pre) => ([...pre, i.crash_point]))
            setLabel((pre) => ([...pre, i.timestamp]))
          }
        }
        if (dataArray[0] == 'INITIAL_BETS') {
          setBets((pre) => ([...pre, ...dataArray[1]]))
        }

        setChartData((prevChartData: any) => ({
          labels: [...label],
          datasets: [
            {
              ...prevChartData.datasets[0],
              data: [...crash]
            }
          ]
        }));
        const maxLen = 10;
        if (chartData.labels.length > maxLen) {
          setChartData((prevChartData: any) => ({
            ...prevChartData,
            labels: prevChartData.labels.slice(-maxLen),
            datasets: [
              {
                ...prevChartData.datasets[0],
                data: prevChartData.datasets[0].data.slice(-maxLen)
              }
            ]
          }));
        }
        if(dataArray[0] == 'BET'){
          console.log(dataArray)
        }

        if (dataArray[0] == 'STREAM') {

          setCrash(pre => ([...pre, parseFloat(dataArray[1][3])]))
          setLabel(pre => ([...pre, dataArray[1][1]]))
          setChartData((prevChartData: any) => ({
            labels: [...prevChartData.labels, dataArray[1][1]],
            datasets: [
              {
                ...prevChartData.datasets[0],
                data: [...prevChartData.datasets[0].data, parseFloat(dataArray[1][3])]
              }
            ]
          }));
        }
      }
    }
  }, [isPaused])

  setTimeout(() => {
    setPause(!isPaused)
  }, 1000)


  const sendConfig = () => {
    if(!((crashPoint == (null || '')) || (days == (null || '')) || (hours == (null || '')) || (rounds == (null || '')))){
      ws.current?.send(['TIMER_START', crashPoint, rounds, days, hours].toString())
    }else{
      console.log('Empty feilds.')
    }
   
  }

  return (
    <div className="App">
       <span className='status-badge'> <div className="status-spot"></div> Live</span>
      <div className="brand">
      <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlSpace="preserve"
    style={{
      // enableBackground: "new 0 0 2000 677.9",
    }}
    viewBox="0 0 2000 677.9"
    
  >
    <path
      d="M1614.3 641.1H327.2c-15.7 0-30.2-6.4-41.4-17.1-18.9-17.9-25.8-47.8-20.1-75.2l53.4-430.1c1-4.7 1.4-9.4 1.8-14.2 3.2-38 31-67.7 64.8-67.7h1287.1c15.7 0 30.2 6.4 41.4 17.1 18.9 17.9 25.8 47.7 20.1 75.1-16 76.1-43 380.2-53.5 430.2-1 4.7-1.4 9.4-1.8 14.2-3.1 38-30.9 67.7-64.7 67.7z"
      style={{
        fillRule: "evenodd",
        clipRule: "evenodd",
        fill: "#002d72",
      }}
    />
    <path
      d="M708.1 229.7c-17.1-21.7-45.8-28-71.4-27.6h-73.3l67.8 104.7 76.9-77.1zM510.9 453.2l250.2-251.1h119.8L762.1 321.3l100.1 154.2-61.2.1c-58.6 0-70.2-18.7-80.3-31L688.6 395l-80.2 80.6-185 .2c8.5-48.2 17.5-96.5 26.2-144.7l7.9-23.2-57.2 27 .4-70.6 95.6-62.4h60.9l-46.3 251.3z"
      style={{
        fillRule: "evenodd",
        clipRule: "evenodd",
        fill: "#fefefe",
      }}
    />
    <path
      d="m1388.5 202.1-11.8 64.7h73.7l-37.6 208.8h82.7l37.7-208.8h74.3l11.9-64.7h-230.9zM931.6 410.9l8.7-47.7 54.2.1h12.8c47.7.1 34.6 47.5-7.9 47.5l-67.8.1zm159.3-79.5c16.9-11.1 26.2-28.3 29.7-47.2 8.1-44.9-21.6-82-88.4-82l-144.6.2-40 218.4 35.6 54.8h102.9c67.5 0 117.5-31.5 127.4-86.1 7.8-45.1-22.5-57.8-22.6-58.1zm-80.8-21h-59.9l8-43.7 47.4.1h11.8c43.6.1 31.7 43.6-7.3 43.6zm202.5 59.3-7.6 41.2h134.4l-11.8 64.7h-216.8l49.7-273.5h208.7l-11.8 64.7h-126.1l-7 38.2h109.3l-11.8 64.7h-109.2z"
      style={{
        fillRule: "evenodd",
        clipRule: "evenodd",
        fill: "#0bbbef",
      }}
    />
  </svg>
      </div>

      
       <h2>1xBet Autobot v1.0.0</h2>
    <div className="top-card">
     
      <div className="multiplyer">1.01 <span className="x">x</span> </div>
      <p>Odd</p>
    </div>
    <div className="thread-summary">
        <div className="thread-number">
          3
          <p>Number of Threads</p>
        </div>
        <div className="thread-lost">
          0
          <p>Lost threads</p>
        </div>
        <div className="total-value">
          1,000,000
          <p>Total value</p>
        </div>
      </div>
<h2>Thread Details</h2>
      <div className="threads">
        <div className="thread-box">
          <span>Active</span>
          1,000,000
          <p>Thread One</p>
          <p>1000 rounds</p>
        </div>
        <div className="thread-box">
        <span>Active</span>

          1,000,000
          <p>Thread One</p>
          <p>1000 rounds</p>
        </div>
        <div className="thread-box">
        <span>Active</span>

          1,000,000
          <p>Thread One</p>
          <p>1000 rounds</p>
        </div>
      </div>
      <h2>Realtime odds chart</h2>
      <div className='chart'>
        <Line ref={chartRef} data={chartData} options={options} />
        <button onClick={() => {
          if (chartRef && chartRef.current) {
            chartRef.current.resetZoom();
          }
        }}>rest zoom</button>
      </div>
        <h2>Set configurations</h2>
      <div className="form">
      <input type="numer" onChange={(e) => setRounds(e.target.value)} placeholder='Rounds' />
      <input type="numer" onChange={(e) => setDays(e.target.value)} placeholder='Days' />
      <input type="numer" onChange={(e) => setHours(e.target.value)} placeholder='Hours' />
      <input type="numer" onChange={(e) => setCrashPoint(e.target.value)} placeholder='Crash point' />

      <button onClick={() => sendConfig()}>Start</button>
      <button onClick={() => sendConfig()}>Stop</button>
      </div>
      <div>
        <h2>Task History</h2>
        <table>
          
            <tr>
              <th>Time</th>
              <th>Crash point</th>
              <th>Thread</th>
              <th>Output</th>
              <th>Rounds</th>
            </tr>
      
          {bets.map((element) => (
            <tr>
                <td>{element[7]}</td>
                <td>{element[2]}</td>
                <td>{element[4]}</td>
                <td>{element[6]}</td>
                <td>{element[5]}</td>
            </tr>
          ))}

            <tr>
                <td>0</td>
                <td>0</td>
                <td>0</td>
                <td>0</td>
                <td>0</td>
            </tr>
            <tr>
                <td>0</td>
                <td>0</td>
                <td>0</td>
                <td>0</td>
                <td>0</td>
            </tr>
            <tr>
                <td>0</td>
                <td>0</td>
                <td>0</td>
                <td>0</td>
                <td>0</td>
            </tr>
        </table>
      </div>
    </div>
  );
}

export default App;
