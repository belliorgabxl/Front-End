import { useState } from "react";
import useWebSocket from "react-use-websocket";
import "./App.css";
import { useEffect } from "react";

type MessageBody={
  action: string,
  type: string,
  body : unknown
}

function App() {
  const [count, setCount] = useState(0);
  const outputPins = [18,19,22,23];
  const defaultOutputPin =  outputPins[0]
  const [selectedPin , setSelectedPin] = useState(defaultOutputPin);
  const [pinValue , setPinValue ] = useState(false);
  const { lastMessage  ,sendMessage , readyState } = useWebSocket("wss://qxcmtxav3j.execute-api.ca-central-1.amazonaws.com");
  useEffect(() => {
    if (lastMessage === null){
      return;
    }
    const parsedMessage = JSON.parse(lastMessage.data) as MessageBody
    if (parsedMessage.action !=='msg'){
        return;
    }
    if (parsedMessage.type === 'output'){
      const body = parsedMessage.body as number
      setPinValue(body === 0 ? false : true);
    }

  } , [lastMessage ,setPinValue])

  useEffect(() => {
  sendMessage(
    JSON.stringify({
      action:"msg",
      type: 'cmd',
      body:{
        type:"digitalRead",
        pin: defaultOutputPin,
      }
    })
  )
   outputPins.forEach((pin)=> {
    sendMessage(JSON.stringify({
      action: 'msg',
      type:'cmd',
      body: {
        type: "pinMode",
        pin ,
        mode: "output"
      }
    }))
   })
  })

  return (
    <div>
      <h1>ESP-32 Control</h1>
      <label for="countries" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Select a Pin</label>
        <select 
        value={selectedPin}
        onChange={(e)=>{
          const newPin = parseInt(e.target.value,10)
          setSelectedPin(newPin);
          sendMessage(JSON.stringify({
            action:"msg",
            type:"cmd",
            body :{
              type:"digitalRead",
              pin: newPin,
            }
          }))
        }}
         className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
          {outputPins.map((pin)=><option value={pin}>PIN{pin}</option>)}
        </select>
        <div className="m-4 ">
          <label className="inline-flex items-center cursor-pointer">
          <input type="checkbox"
           checked ={pinValue}
           onChange={()=>{
            const newValue = !pinValue;
            setPinValue(newValue);
            sendMessage(JSON.stringify({
              action : "msg",
              type: "cmd",
              body:{
                type: "digitalWrite",
                pin: selectedPin,
                value: newValue? 1 : 0,
              }
            }))
           }}
          className="sr-only peer"/>
          <div className="relative w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
              <h1 className="ml-4">{pinValue ? "on" : "Off"}</h1>
            </span>
          </label>
        </div>
    </div>
  );
}

export default App;
