import { useEffect, useState } from "react";
import CryptoJS from "crypto-js";
import { io } from 'socket.io-client';

function App() {
  let [secretKey, setSecretKey] = useState(null);
  // let [api_url, setApiUrl] = useState("http://localhost:8000/");
  let [api_url, setApiUrl] = useState(null);
  let [agent_code, setAgentCode] = useState(null);
  let [playerPhone, setPlayerPhone] = useState(null);
  let [lan, setLan] = useState("en");
  let [playerName, setPlayerName] = useState(null);
  let [amount, setAmount] = useState(10000);
  let [sign, setSign] = useState(null);
  let [data, setData] = useState(null);
  let [isLoading, setIsLoading] = useState(false);
  let [deviceIpAddress, setDeviceIpAddress] = useState(null);
  let [callbackURL, setCallbackURL] = useState("https://www.google.com/");
  const [activeUser, setActiveUser] = useState(0);

  useEffect(() => {
    const getIpAddress = async () => {
      try {
        const response = await fetch("https://api.ipify.org/?format=json");
        if (response.ok) {
          const jsonData = await response.json();
          setDeviceIpAddress(jsonData.ip);
        } else {
          console.error("Error:", response.status);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };
    getIpAddress();
  }, []);


  useEffect(() => {

    const socket = io('https://api.systemdsmm.com/', {
      transports: ["websocket"],
    });
    socket.on('connect', () => {
      console.log('socket connected', socket.id);
    });
    socket.on('current_user_count', (data) => {
      console.log('current user ', data.data);
      setActiveUser(data.data);
      // user_count.innerText = data.data
    });
  }, []);


  const postData = async () => {
    let requestData = {
      player_phone: playerPhone,
      player_name: playerName,
      unit_amount: amount,
      language: lan,
      device_ip_address: deviceIpAddress,
      callback_url: callbackURL,
    };
    const signature = generateSignature(requestData, secretKey);
    // Encrypt the data
    const encryptedData = encryptData(requestData, secretKey);
    setSign(signature);
    setData(encryptedData);
    // let api_url = 'https://daigyi.click/';
    setIsLoading(true);
    fetch(`${api_url}api/users/init`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept-Language": "mm"
        // Add any other headers you need
      },
      body: JSON.stringify({
        data: encryptedData,
        signature: signature,
        agent_code: agent_code,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("data", data);
        setIsLoading(false);
        if (data.status == "success") {
          window.open(data.data.url);
        } else {
          alert(data.message);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        setIsLoading(false);
      });
  };

  const withdrawSubmit = async () => {
    let requestData = {
      player_phone: playerPhone,
    };
    const signature = generateSignature(requestData, secretKey);
    // Encrypt the data
    const encryptedData = encryptData(requestData, secretKey);

    setSign(signature);
    setData(encryptedData);

    try {
      setIsLoading(true);
      const response = await fetch(`${api_url}api/soccer/user-withdraw`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Add any other headers you need
        },
        body: JSON.stringify({
          data: encryptedData,
          signature: signature,
          agent_code: agent_code,
        }),
      });

      if (response.ok) {
        const jsonData = await response.json();
        console.log("data", jsonData);
        if (jsonData.status == "success") {
          alert("withdraw success");
        } else {
          alert(jsonData.message);
        }
        // setData(jsonData.data);
        setIsLoading(false);
      } else {
        setIsLoading(false);
        console.error("Error:", response.status);
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Error:", error);
    }
  };

  const generateSignature = (requestData, secretKey) => {
    // Step 1: Create request data array
    const dataArray = Object.entries(requestData);

    // Step 2: Sort array by key in ascending order
    dataArray.sort((a, b) => a[0].localeCompare(b[0]));

    // Step 3: Generate a URL-encoded query string
    const queryString = dataArray
      .map(
        (entry) =>
          `${encodeURIComponent(entry[0])}=${encodeURIComponent(entry[1])}`
      )
      .join("&");

    // Step 4: Use sha1 hmac algorithm with secret Key for signing
    const hmac = CryptoJS.HmacSHA1(queryString, secretKey);
    const signature = hmac.toString(CryptoJS.enc.Hex);

    return signature;
  };

  const encryptData = (data, secretKey) => {
    const dataString = JSON.stringify(data);
    const encryptedData = CryptoJS.AES.encrypt(
      dataString,
      secretKey
    ).toString();
    return encryptedData;
  };

  return (
    <div>
      <h1>Agent's Site Demo</h1> Prod Active User - <span>{activeUser}</span>
      <hr></hr>
      <h5>Player Phone: {playerPhone}</h5>
      <h5>Player Name: {playerName}</h5>
      <h5>Amount: {amount}</h5>
      <h5>Language: {lan}</h5>
      <h5>Current Device IP Address: {deviceIpAddress}</h5>
      <h5>Callback URL: {callbackURL}</h5>
      <hr></hr>
      <h5>Secret Key: {secretKey}</h5>
      <h5>API URL: {api_url}</h5>
      <hr></hr>
      <h5>Signature: {sign}</h5>
      <h5>Data: {data}</h5>
      <h5>Agent Code: {agent_code}</h5>
      <hr></hr>
      <input
        type="text"
        placeholder="Player Phone"
        onChange={(e) => setPlayerPhone(e.target.value)}
      />
      <input
        type="text"
        placeholder="Player Name"
        onChange={(e) => setPlayerName(e.target.value)}
      />
      <input
        type="text"
        placeholder="Amount"
        onChange={(e) => setAmount(e.target.value)}
      />
      <select onChange={(e) => setLan(e.target.value)}>
        <option value="en">English</option>
        <option value="mm">Myanmar</option>
        <option value="zh">Chinese</option>
      </select>
      <br></br>
      <br></br>
      <input
        type="text"
        placeholder="Agent Code"
        onChange={(e) => setAgentCode(e.target.value)}
      />
      <input
        type="text"
        placeholder="Secret Key"
        onChange={(e) => setSecretKey(e.target.value)}
      />
      <input
        type="text"
        placeholder="API URL"
        onChange={(e) => setApiUrl(e.target.value)}
      />

      <hr></hr>

      <button onClick={postData}>
        {" "}
        {isLoading ? "Loading..." : "Go To DaiSport"}
      </button>
      <button onClick={withdrawSubmit}>
        {" "}
        {isLoading ? "Loading..." : "Withdraw"}{" "}
      </button>
    </div>
  );
}

export default App;
