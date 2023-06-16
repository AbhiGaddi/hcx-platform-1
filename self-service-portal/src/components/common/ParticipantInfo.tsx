
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import { useAuthActions } from "../../recoil/actions/auth.actions";
import _ from "lodash";
import { toast } from "react-toastify";
import { getParticipant } from "../../api/RegistryService";
import { addParticipantDetails } from "../../reducers/participant_details_reducer";
import { post } from "../../api/APIService";

const ParticipantInfo =() =>{

    const dispatch = useDispatch()
    const participantDetails : Object = useSelector((state: RootState) => state.participantDetailsReducer.participantDetails);
    const authToken = useSelector((state: RootState) => state.tokenReducer.participantToken);
    console.log("part details in dash", participantDetails);
  
    const { login } = useAuthActions();
  
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [address, setAddress] = useState(_.get(participantDetails,"address") || {});
    const [encryptionCert, setEncryptionCert] = useState(_.get(participantDetails,"encryption_cert") || '');
    const [endpointUrl, setEndpointUrl] = useState(_.get(participantDetails,"endpoint_url") || '');
    const [certType, setCertType] = useState("text");
    const [certError, setCertError] = useState(false);
    const [endpointError, setEndPointError] = useState(false);
  
  
    useEffect(() => {
      setAddress(_.get(participantDetails,"address") || {});
      setEncryptionCert(_.get(participantDetails,"encryption_cert") || '');
      setEndpointUrl(_.get(participantDetails,"endpoint_url") || '');
    },[participantDetails]);
    
  
    const handleChildData = (data: string) => {
      console.log("Side Bar clicked", data);
    };
  
  
  const getIdentityVerification = (type: string) => {
    if (_.get(participantDetails,"sponsors[0].status") == "accepted"){
      return  (type == "color" ? "text-green-500" : "Successful")  
    }else if(_.get(participantDetails, "sponsors[0].status") == "rejected") {
    return  (type == "color" ? "text-green-500" : "Rejected")  
    }else{
      return (type == "color" ? "text-yellow-500" : "Pending")  
    }
  }
  
  
  const getStatusVerification = (type: string) => {
    if (_.get(participantDetails,"status") == "Active"){
      return  (type == "color" ? "text-green-500" : "Active")  
    }else if(_.get(participantDetails, "status") == "Inactive") {
    return  (type == "color" ? "text-red-500" : "Inactive")  
    }else if(_.get(participantDetails, "status") == "Blocked") {
      return  (type == "color" ? "text-red-500" : "Blocked")  
      }
    else{
      return (type == "color" ? "text-yellow-500" : "Created")  
    }
  }
  
  const onSubmit = () => {
    //setSending(true)
    if(endpointUrl == "" || encryptionCert == ""){
      if (endpointUrl == "") setEndPointError(true);
      if(encryptionCert == "") setCertError(true);
    }else{
    const formData = { "jwt_token": authToken, participant: { "participant_code": _.get(participantDetails,"participant_code"), "participant_name": _.get(participantDetails,"participant_name"), "endpoint_url": endpointUrl, "encryption_cert": encryptionCert 
                        ,"address" : address} };
    post("/participant/onboard/update", formData).then((response => {
        const result = _.get(response, 'data.result') || {}
        console.log('result ', result)
        toast.success("Particpant Information updated successfully");
    })).catch(err => {
        toast.error(_.get(err, 'response.data.error.message') || "Internal Server Error", {
            position: toast.POSITION.TOP_CENTER
        });
    }).finally(() => {
        //setSending(false)
    })
    }
  }
  
    const refreshPage = () => {
      getParticipant(_.get(participantDetails,"primary_email")).then((res :any) => {
         dispatch(addParticipantDetails(res["data"]["participants"][0]));
      }).catch(err => {
          toast.error(_.get(err, 'response.data.error.message') || "Internal Server Error", {
              position: toast.POSITION.TOP_CENTER
          });
      })
    }
  

    return(
        <div className="p-4 sm:ml-64">
        <div className="p-4 border-2 border-gray-200 border rounded-lg dark:border-gray-700 mt-14">
        <form className="w-full p-12">
        <div className="flex flex-wrap -mx-3 mb-6 border-b-2 shadow-l shadow-bottom justify-between">
          <label
            className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
          >
            Basic Information
          </label>
          <div className="flex flex-wrap mb-2">
          {_.get(participantDetails,"communication.emailVerified") ?
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 inline-block mr-1 border rounded-full border-green-500" fill="none" viewBox="0 0 24 24" stroke="green">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /> 
          </svg> :
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 inline-block mr-1" viewBox="0 0 24 24" fill="none" stroke="red" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" />
          </svg>}
          <label
            className="block uppercase tracking-wide text-green-700 text-xs font-bold m-1"
            htmlFor="grid-first-name"
          >
            {_.get(participantDetails,"communication.emailVerified") ? "Active" : "Inactive"}
          </label>
          </div>
      </div> 
      <div className="flex flex-wrap -mx-3 mb-6">
        <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
          <label
            className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
            htmlFor="grid-first-name"
          >
            Participant Name
          </label>
          <input
            className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
            id="grid-first-name"
            type="text"
            placeholder="Jane"
            disabled
            value={_.get(participantDetails,"participant_name")}
          />
          {/* <p className="text-red-500 text-xs italic">Please fill out this field.</p> */}
        </div>
        <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
          <label
            className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
            htmlFor="grid-last-name"
          >
            Participant Code
          </label>
          <input
            className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            id="grid-last-name"
            type="tel"
            placeholder=""
            disabled
            value={_.get(participantDetails,"participant_code")}
          />
        </div>
      </div>
      <div className="flex flex-wrap -mx-3 mb-6">
        <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0 flex flex-wrap">
          <label
            className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
            htmlFor="grid-first-name"
          >
            Email Address
          </label>
          <input
            className="appearance-none block w-11/12 bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
            id="grid-first-name"
            type="text"
            placeholder="abc@abc.com"
            disabled
            value={_.get(participantDetails,"primary_email")}
          />
          {/* <p className="text-red-500 text-xs italic">Please fill out this field.</p> */}
          &nbsp;&nbsp;
          {_.get(participantDetails,"communication.emailVerified") ?
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 inline-block mr-1 border rounded-full border-green-500" fill="none" viewBox="0 0 24 24" stroke="green">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /> 
          </svg> :
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 inline-block mr-1" viewBox="0 0 24 24" fill="none" stroke="red" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" />
          </svg>}
        </div>
        <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0 flex flex-wrap">
          <label
            className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
            htmlFor="grid-first-name"
          >
            Phone Number
          </label>
          <input
            className="appearance-none block w-11/12 bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
            id="grid-first-name"
            type="number"
            placeholder=""
            disabled
            value={_.get(participantDetails,"primary_mobile")}
          />
          {/* <p className="text-red-500 text-xs italic">Please fill out this field.</p> */}
          &nbsp;&nbsp;
          {_.get(participantDetails,"communication.phoneVerified") ?
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 inline-block mr-1 border rounded-full border-green-500" fill="none" viewBox="0 0 24 24" stroke="green">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /> 
          </svg> :
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 inline-block mr-1" viewBox="0 0 24 24" fill="none" stroke="red" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4M12 16h.01" />
        </svg>
          }
        </div>
      </div>
      <div className="flex flex-wrap -mx-3 mb-6 border-b-2 shadow-l shadow-bottom">
      <label
            className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
          >
            Encrytption Cert and Web Endpoint URL
          </label>
      </div> 
      <div className="flex flex-wrap -mx-3 mb-6">
        <div className="w-full px-3">
          <label
            className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
            htmlFor="grid-password"
          >
            Encryption Certificate
          </label>
          <div className="flex mb-3">
              <div className="flex items-center mr-4">
                  <input id="inline-radio" type="radio" value="" name="inline-radio-group" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                         onClick={() => setCertType("text")} defaultChecked></input>
                  <label htmlFor="inline-radio" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Certificate URL</label>
              </div>
              <div className="flex items-center mr-4">
                  <input id="inline-2-radio" type="radio" value="" name="inline-radio-group" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                  onClick={() => setCertType("textarea")}></input>
                  <label htmlFor="inline-2-radio" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Certificate</label>
              </div>
    
          </div>
          {certType == "textarea" ? 
          <textarea
            className={"appearance-none block w-full bg-gray-100 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" + (certError? " border-red-600": "")}
            id="grid-password"
            placeholder="Please provide your public certificate here"
            //value={encryptionCert}
            onChange={(event) => {setEncryptionCert(event.target.value); setCertError(false)}}
          /> :
          <input
            className={"appearance-none block w-full bg-gray-100 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" + (certError? " border-red-600": "")}
            id="grid-password"
            type="text"
            placeholder=""
            value={encryptionCert}
            onChange={(event) => {setEncryptionCert(event.target.value); setCertError(false)}}
          />}
        </div>
      </div>
      <div className="flex flex-wrap -mx-3 mb-6">
        <div className="w-full px-3">
          <label
            className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
            htmlFor="grid-password"
          >
            Endpoint URL
          </label>
          <input
            className={"appearance-none block w-full bg-gray-100 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" + (endpointError ? " border-red-600": "")}
            id="grid-password"
            type="text"
            placeholder=""
            value={endpointUrl}
            onChange={(event) => {setEndpointUrl(event.target.value); setEndPointError(false)}}
          />
        </div>
      </div>

      <div className="flex flex-wrap -mx-3 mb-6 border-b-2 shadow-l shadow-bottom">
      <label
            className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
          >
            Status
          </label>
      </div>
      <div className="flex flex-wrap -mx-3 mb-2">
        <div className="w-full md:w-1/6 px-3 mb-6 md:mb-0">
        <label
            className="block tracking-wide text-gray-700 text-sm font-bold mb-2"
          > 
            Identity Verification : 
          </label>
      </div>
      <div className="w-full md:w-1/3 px-3 mb-6 md:mb-0">
        <label
            className={"block tracking-wide text-sm font-bold mb-2 " + getIdentityVerification("color")}
          > 
             {getIdentityVerification("")}
             <p className="text-gray-600 text-xs italic">
            Note: Identity Verification will be done by HCX team for Payors
          </p>
          </label>
      </div>
      <div className="w-full md:w-1/6 px-3 mb-6 md:mb-0">
        <label
            className="block tracking-wide text-gray-700 text-sm font-bold mb-2"
          > 
            Participant Status : 
          </label>
      </div>
      <div className="w-full md:w-1/3 px-3 mb-6 md:mb-0">
        <label
            className={"block tracking-wide text-sm font-bold mb-2 " + getStatusVerification("color")}
          > 
             {getStatusVerification("")}
             <p className="text-gray-600 text-xs italic">
            Note: Status needs to be Active to make HCX API calls
          </p>
          </label>
      </div>
      </div>     
      <div className="flex flex-wrap -mx-3 mb-6 border-b-2 shadow-l shadow-bottom">
      <label
            className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
          >
            Address
          </label>
      </div> 
      {/* <div className="flex flex-wrap -mx-3 mb-6">
        <div className="w-1/2 px-3">
          <label
            className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
            htmlFor="grid-password"
          >
            Password
          </label>
          <input
            className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            id="grid-password"
            type="password"
            placeholder="******************"
          />
          <p className="text-gray-600 text-xs italic">
            Make it as long and as crazy as you'd like
          </p>
        </div>
      </div> */}
      <div className="flex flex-wrap -mx-3 mb-2">
        <div className="w-full md:w-1/3 px-3 mb-6 md:mb-0">
          <label
            className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
            htmlFor="grid-city"
          >
            Plot
          </label>
          <input
            className="appearance-none block w-full bg-gray-100 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            id="grid-city"
            type="text"
            placeholder=""
            value={_.get(address,"plot") || ''}
            onChange={(event) => setAddress({...address, "plot":event.target.value})}
          />
        </div>
        <div className="w-full md:w-1/3 px-3 mb-6 md:mb-0">
        <label
            className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
            htmlFor="grid-city"
          >
            Street
          </label>
          <input
            className="appearance-none block w-full bg-gray-100 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            id="grid-city"
            type="text"
            placeholder=""
            value={_.get(address,"street") || ''}
            onChange={(event) => setAddress({...address, "street":event.target.value})}
          />
    
        </div>
        <div className="w-full md:w-1/3 px-3 mb-6 md:mb-0">
          <label
            className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
            htmlFor="grid-zip"
          >
            Landmark
          </label>
          <input
            className="appearance-none block w-full bg-gray-100 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            id="grid-zip"
            type="text"
            placeholder=""
            value={_.get(address,"landmark") || ''}
            onChange={(event) => setAddress({...address, "landmark":event.target.value})}
          />
        </div>
      </div>
      <div className="flex flex-wrap -mx-3 mb-8">
        <div className="w-full md:w-1/3 px-3 mb-6 md:mb-0">
          <label
            className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
            htmlFor="grid-city"
          >
            District
          </label>
          <input
            className="appearance-none block w-full bg-gray-100 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            id="grid-city"
            type="text"
            placeholder=""
            value={_.get(address,"district") || ''}
            onChange={(event) => setAddress({...address, "district":event.target.value})}
          />
        </div>
        <div className="w-full md:w-1/3 px-3 mb-6 md:mb-0">
        <label
            className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
            htmlFor="grid-city"
          >
            State
          </label>
          <input
            className="appearance-none block w-full bg-gray-100 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            id="grid-city"
            type="text"
            placeholder=""
            value={_.get(address,"state") || ''}
            onChange={(event) => setAddress({...address, "state":event.target.value})}
          />
    
        </div>
        <div className="w-full md:w-1/3 px-3 mb-6 md:mb-0">
          <label
            className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
            htmlFor="grid-zip"
          >
            Pincode
          </label>
          <input
            className="appearance-none block w-full bg-gray-100 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            id="grid-zip"
            type="number"
            placeholder=""
            value={_.get(address,"pincode") || ''}
            onChange={(event) => setAddress({...address, "pincode":event.target.value})}
          />
        </div>
      </div>
      
      <div className="flex flex-wrap -mx-3 mb-6 justify-between">
      <button
                              className="mb-3 inline-block w-1/4 rounded px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_rgba(0,0,0,0.2)] transition duration-150 ease-in-out hover:shadow-[0_8px_9px_-4px_rgba(0,0,0,0.1),0_4px_18px_0_rgba(0,0,0,0.2)] focus:shadow-[0_8px_9px_-4px_rgba(0,0,0,0.1),0_4px_18px_0_rgba(0,0,0,0.2)] focus:outline-none focus:ring-0 active:shadow-[0_8px_9px_-4px_rgba(0,0,0,0.1),0_4px_18px_0_rgba(0,0,0,0.2)]"
                              type="button"
                              data-te-ripple-init=""
                              data-te-ripple-color="light"
                              style={{
                                background:
                                  "linear-gradient(to right, #1C4DC3, #3632BE, #1D1991, #060347)"
                              }}
                              onClick={() => onSubmit()}
                            >
                              Update
                            </button>
        <button  
                  className="mb-3 inline-block w-1/5 rounded px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_rgba(0,0,0,0.2)] transition duration-150 ease-in-out hover:shadow-[0_8px_9px_-4px_rgba(0,0,0,0.1),0_4px_18px_0_rgba(0,0,0,0.2)] focus:shadow-[0_8px_9px_-4px_rgba(0,0,0,0.1),0_4px_18px_0_rgba(0,0,0,0.2)] focus:outline-none focus:ring-0 active:shadow-[0_8px_9px_-4px_rgba(0,0,0,0.1),0_4px_18px_0_rgba(0,0,0,0.2)]"
                  type="button"
                  data-te-ripple-init=""
                  data-te-ripple-color="light"
                  style={{
                    background:
                      "linear-gradient(to right, #1C4DC3, #3632BE, #1D1991, #060347)"
                  }}
                  onClick={() => refreshPage()}>
             Refresh Page       
        </button>
                      
      </div>
    </form>
    
        </div>
      </div>
    );


}

export default ParticipantInfo;