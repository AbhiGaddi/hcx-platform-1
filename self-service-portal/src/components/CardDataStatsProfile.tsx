import React, { ReactNode, useEffect, useState } from 'react';
import DropdownDefault from './DropdownDefault';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import _ from 'lodash';
import { reverifyLink } from '../api/UserService';
import { toast } from 'react-toastify';



const CardDataStatsProfile: React.FC = () => {



  const appData: Object = useSelector((state: RootState) => state.appDataReducer.appData);
  const participantDetails: Object = useSelector((state: RootState) => state.participantDetailsReducer.participantDetails);
  const [email, setEmail] = useState(_.get(participantDetails, "primary_email") || "example@org.com");
  const [phone, setPhone] = useState(_.get(participantDetails, "primary_mobile") || "1234567890");
  const [org, setOrg] = useState(_.get(participantDetails, "participant_name") || "Organization")

  useEffect(() => {
    setEmail(_.get(participantDetails, "primary_email") || "example@org.com");
    setPhone(_.get(participantDetails, "primary_mobile") || "1234567890");
    setOrg(_.get(participantDetails, "participant_name") || "Organization")
  },[participantDetails])
  
  const verifyResend = (type: any) => {
    let payload = {};
    if (type == "email") {
      payload = {
        "primary_email": _.get(participantDetails, "primary_email"),
        "participant_code": _.get(participantDetails, "participant_code"),
        "participant_name": _.get(participantDetails, "participant_name")
      }
    } else {
      payload = {
        "primary_mobile": _.get(participantDetails, "primary_mobile"),
        "participant_code": _.get(participantDetails, "participant_code"),
        "participant_name": _.get(participantDetails, "participant_name")
      }
    }
    reverifyLink(payload).then((res: any) => {
      toast.success(`Re-verification link successfully sent to ${type}`, {
        position: toast.POSITION.TOP_CENTER
      });
    }).catch(err => {
      toast.error(_.get(err, 'response.data.error.message') || "Internal Server Error", {
        position: toast.POSITION.TOP_CENTER
      });
    });
  }
  
  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="mb-1.5 text-title-md2 font-bold text-black dark:text-white">
            Participant Information
          </h2>
          <p className="font-medium">Paricipant Code : {_.get(participantDetails, "participant_code") ? _.get(participantDetails, "participant_code") : ""}</p>
        </div>
        <DropdownDefault />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6 2xl:gap-7.5">
        <div className="rounded-sm border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark md:p-6 xl:p-7.5">
        <svg
    width="34px"
    height="34px"
    viewBox="0 0 16 16"
    xmlns="http://www.w3.org/2000/svg"
    fill="#3C50E0"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M9.111 4.663A2 2 0 1 1 6.89 1.337a2 2 0 0 1 2.222 3.326zm-.555-2.494A1 1 0 1 0 7.444 3.83a1 1 0 0 0 1.112-1.66zm2.61.03a1.494 1.494 0 0 1 1.895.188 1.513 1.513 0 0 1-.487 2.46 1.492 1.492 0 0 1-1.635-.326 1.512 1.512 0 0 1 .228-2.321zm.48 1.61a.499.499 0 1 0 .705-.708.509.509 0 0 0-.351-.15.499.499 0 0 0-.5.503.51.51 0 0 0 .146.356zM3.19 12.487H5v1.005H3.19a1.197 1.197 0 0 1-.842-.357 1.21 1.21 0 0 1-.348-.85v-1.81a.997.997 0 0 1-.71-.332A1.007 1.007 0 0 1 1 9.408V7.226c.003-.472.19-.923.52-1.258.329-.331.774-.52 1.24-.523H4.6a2.912 2.912 0 0 0-.55 1.006H2.76a.798.798 0 0 0-.54.232.777.777 0 0 0-.22.543v2.232h1v2.826a.202.202 0 0 0 .05.151.24.24 0 0 0 .14.05zm7.3-6.518a1.765 1.765 0 0 0-1.25-.523H6.76a1.765 1.765 0 0 0-1.24.523c-.33.335-.517.786-.52 1.258v3.178a1.06 1.06 0 0 0 .29.734 1 1 0 0 0 .71.332v2.323a1.202 1.202 0 0 0 .35.855c.18.168.407.277.65.312h2a1.15 1.15 0 0 0 1-1.167V11.47a.997.997 0 0 0 .71-.332 1.006 1.006 0 0 0 .29-.734V7.226a1.8 1.8 0 0 0-.51-1.258zM10 10.454H9v3.34a.202.202 0 0 1-.06.14.17.17 0 0 1-.14.06H7.19a.21.21 0 0 1-.2-.2v-3.34H6V7.226c0-.203.079-.398.22-.543a.798.798 0 0 1 .54-.232h2.48a.778.778 0 0 1 .705.48.748.748 0 0 1 .055.295v3.228zm2.81 3.037H11v-1.005h1.8a.24.24 0 0 0 .14-.05.2.2 0 0 0 .06-.152V9.458h1V7.226a.777.777 0 0 0-.22-.543.798.798 0 0 0-.54-.232h-1.29a2.91 2.91 0 0 0-.55-1.006h1.84a1.77 1.77 0 0 1 1.24.523c.33.335.517.786.52 1.258v2.182c0 .273-.103.535-.289.733-.186.199-.44.318-.711.333v1.81c0 .319-.125.624-.348.85a1.197 1.197 0 0 1-.842.357zM4 1.945a1.494 1.494 0 0 0-1.386.932A1.517 1.517 0 0 0 2.94 4.52 1.497 1.497 0 0 0 5.5 3.454c0-.4-.158-.784-.44-1.067A1.496 1.496 0 0 0 4 1.945zm0 2.012a.499.499 0 0 1-.5-.503.504.504 0 0 1 .5-.503.509.509 0 0 1 .5.503.504.504 0 0 1-.5.503z"
    />
  </svg>
          <h4 className="mt-5 mb-2 font-medium">Organization</h4>
          <h3 className="mb-2 text-title-md font-bold text-black dark:text-white">
          {org}
          </h3>
           <p className="flex items-center gap-1 text-sm font-medium">
            {_.get(participantDetails, "status") == "Active" ?
            <span className="text-meta-3">Active</span> :
            <span className="text-red">Inactive</span>
            }
          </p>
          
        </div>

        <div className="rounded-sm border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark md:p-6 xl:p-7.5">
          <svg
            width="34"
            height="34"
            viewBox="0 0 34 34"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M11.1027 15.5125C14.3965 15.5125 17.1059 12.9093 17.1059 9.6687C17.1059 6.42808 14.3965 3.82495 11.1027 3.82495C7.80898 3.82495 5.09961 6.42808 5.09961 9.6687C5.09961 12.9093 7.80898 15.5125 11.1027 15.5125ZM11.1027 6.2687C13.0684 6.2687 14.7152 7.80933 14.7152 9.72183C14.7152 11.6343 13.1215 13.175 11.1027 13.175C9.08398 13.175 7.49023 11.6343 7.49023 9.72183C7.49023 7.80933 9.13711 6.2687 11.1027 6.2687Z"
              fill="#10B981"
            />
            <path
              d="M24.4373 18.0625C27.3061 18.0625 29.5904 15.8313 29.5904 13.0156C29.5904 10.2 27.2529 7.96875 24.4373 7.96875C21.6217 7.96875 19.2842 10.2 19.2842 13.0156C19.2842 15.8313 21.6217 18.0625 24.4373 18.0625ZM24.4373 10.4125C25.9779 10.4125 27.1998 11.5813 27.1998 13.0688C27.1998 14.5563 25.9779 15.725 24.4373 15.725C22.8967 15.725 21.6748 14.5563 21.6748 13.0688C21.6748 11.5813 22.8967 10.4125 24.4373 10.4125Z"
              fill="#10B981"
            />
            <path
              d="M24.7029 18.5937H24.2248C22.6311 18.5937 21.0904 19.0718 19.7623 19.8687C18.3279 17.9562 16.0436 16.6812 13.4936 16.6812H8.76543C4.40918 16.7343 0.956055 20.1874 0.956055 24.4905V28.3155C0.956055 29.3249 1.75293 30.1218 2.7623 30.1218H31.2904C32.2998 30.1218 33.1498 29.2718 33.1498 28.2624V26.9874C33.0967 22.3655 29.3248 18.5937 24.7029 18.5937ZM3.34668 27.7312V24.4905C3.34668 21.5155 5.79043 19.0718 8.76543 19.0718H13.4936C16.4686 19.0718 18.9123 21.5155 18.9123 24.4905V27.7312H3.34668V27.7312ZM30.7061 27.7312H21.2498V24.4905C21.2498 23.6405 21.0904 22.7905 20.8248 21.9937C21.7811 21.303 22.9498 20.9843 24.1717 20.9843H24.6498C27.9436 20.9843 30.6529 23.6937 30.6529 26.9874V27.7312H30.7061Z"
              fill="#10B981"
            />
          </svg>

          <h4 className="mt-5 mb-2 font-medium">Email</h4>
          <h3 className="mb-2 text-title-md font-bold text-black dark:text-white">
            {email}
          </h3>
          <p className="flex items-center justify-between text-sm font-medium">
            {/* <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M13.0157 4.74683C12.7532 4.74683 12.5344 4.96558 12.5344 5.22808V7.6562L9.4063 5.57808C8.94693 5.27183 8.37818 5.27183 7.9188 5.57808L5.0313 7.50308C4.92193 7.59058 4.7688 7.59058 4.63755 7.50308L1.24693 5.24995C1.02818 5.09683 0.721929 5.16245 0.568804 5.3812C0.415679 5.59995 0.481304 5.9062 0.700054 6.05933L4.09068 8.31245C4.55005 8.6187 5.1188 8.6187 5.57818 8.31245L8.46568 6.38745C8.57505 6.29995 8.72818 6.29995 8.85943 6.38745L11.6594 8.2687H9.49381C9.23131 8.2687 9.01255 8.48745 9.01255 8.74995C9.01255 9.01245 9.23131 9.2312 9.49381 9.2312H13.0157C13.2782 9.2312 13.4969 9.01245 13.4969 8.74995V5.22808C13.5188 4.96558 13.2782 4.74683 13.0157 4.74683Z"
                fill="#FB5454"
              />
            </svg> */}
            {_.get(participantDetails, "communication.emailVerified") ?
            <span className="text-meta-3">Active</span> :
            <>
            <span className="text-red">Inactive</span> 
            <button onClick={() => verifyResend("email")} className="text-meta-5 underline">Verify Link</button>
            </>}

            

          </p>
        </div>

        <div className="rounded-sm border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark md:p-6 xl:p-7.5">
        <svg width="34px" height="34px" viewBox="0 0 24 24">
 <g transform="translate(0 -1028.4)">
  <path d="m23.015 1046.8c0 0.3-0.052 0.6-0.156 1.1-0.105 0.4-0.214 0.8-0.329 1-0.219 0.6-0.855 1.1-1.907 1.7-0.98 0.5-1.95 0.8-2.909 0.8h-0.828c-0.261-0.1-0.558-0.2-0.892-0.2-0.333-0.1-0.583-0.2-0.75-0.3-0.156 0-0.443-0.1-0.86-0.3s-0.672-0.2-0.766-0.3c-1.022-0.3-1.934-0.8-2.736-1.3-1.3346-0.8-2.7157-1.9-4.1438-3.3-1.4176-1.5-2.5381-2.9-3.3616-4.2-0.5003-0.8-0.9329-1.7-1.2977-2.7-0.0313-0.1-0.1251-0.4-0.2815-0.8-0.1563-0.4-0.2658-0.7-0.3283-0.9-0.0522-0.1-0.1251-0.4-0.2189-0.7s-0.1616-0.6-0.2033-0.9c-0.0313-0.3-0.0469-0.5-0.0469-0.8 0-1 0.2658-2 0.7974-2.9 0.5837-1.1 1.1362-1.7 1.6574-2 0.2606-0.1 0.615-0.2 1.0632-0.3 0.4586-0.1 0.8287-0.1 1.1101-0.1h0.3284c0.1876 0.1 0.4638 0.5 0.8287 1.2 0.1146 0.2 0.271 0.5 0.469 0.8 0.1981 0.4 0.3805 0.7 0.5473 1 0.1667 0.3 0.3283 0.6 0.4847 0.9 0.0312 0 0.1198 0.1 0.2658 0.4 0.1563 0.2 0.271 0.4 0.344 0.5 0.0729 0.2 0.1094 0.3 0.1094 0.5s-0.1511 0.4-0.4534 0.8c-0.2919 0.3-0.615 0.6-0.9694 0.8-0.344 0.3-0.6672 0.5-0.9694 0.8-0.2919 0.3-0.4378 0.6-0.4378 0.8 0 0.1 0.026 0.2 0.0781 0.3 0.0522 0.2 0.0939 0.3 0.1251 0.3 0.0417 0.1 0.1147 0.2 0.2189 0.4 0.1147 0.2 0.1772 0.3 0.1877 0.3 0.7922 1.4 1.699 2.7 2.7205 3.7 1.0213 1 2.2463 1.9 3.6743 2.7 0.021 0 0.12 0.1 0.297 0.2s0.302 0.2 0.375 0.2 0.178 0.1 0.313 0.1c0.146 0.1 0.266 0.1 0.36 0.1 0.187 0 0.427-0.1 0.719-0.4s0.568-0.6 0.829-1c0.26-0.3 0.547-0.7 0.86-1 0.312-0.3 0.573-0.4 0.781-0.4 0.146 0 0.292 0 0.438 0.1 0.157 0.1 0.344 0.2 0.563 0.3 0.219 0.2 0.349 0.3 0.391 0.3 0.261 0.2 0.537 0.3 0.829 0.5 0.302 0.2 0.635 0.3 1 0.5s0.647 0.4 0.845 0.5c0.729 0.4 1.125 0.7 1.188 0.8 0.031 0.1 0.047 0.2 0.047 0.4" fill="#e74c3c"/>
  <path d="m1.2188 4.75c-0.1453 0.5076-0.2188 1.0294-0.2188 1.5312 0 0.282 0.0312 0.5414 0.0625 0.8126 0.0417 0.2608 0.0937 0.572 0.1875 0.9062 0.0938 0.3337 0.1666 0.5829 0.2188 0.75 0.0625 0.1564 0.1873 0.4575 0.3437 0.875 0.1564 0.417 0.25 0.656 0.2813 0.75 0.3648 1.023 0.7809 1.946 1.2812 2.75 0.8235 1.336 1.9574 2.695 3.375 4.125 1.428 1.419 2.7908 2.55 4.125 3.375 0.803 0.501 1.728 0.947 2.75 1.313 0.094 0.031 0.333 0.124 0.75 0.281 0.417 0.156 0.719 0.25 0.875 0.312 0.167 0.052 0.416 0.125 0.75 0.219s0.614 0.177 0.875 0.219c0.271 0.031 0.562 0.031 0.844 0.031 0.959 0 1.926-0.249 2.906-0.781 1.053-0.585 1.687-1.135 1.906-1.657 0.115-0.26 0.208-0.613 0.313-1.062 0.104-0.459 0.156-0.844 0.156-1.125 0-0.146 0-0.271-0.031-0.344-0.037-0.111-0.227-0.263-0.5-0.437-0.253 0.494-0.853 1.012-1.844 1.562-0.98 0.532-1.947 0.813-2.906 0.813-0.282 0-0.573-0.031-0.844-0.063-0.261-0.042-0.541-0.093-0.875-0.187s-0.583-0.167-0.75-0.219c-0.156-0.063-0.458-0.187-0.875-0.344-0.417-0.156-0.656-0.25-0.75-0.281-1.022-0.365-1.947-0.78-2.75-1.281-1.3342-0.825-2.697-1.956-4.125-3.375-1.4176-1.43-2.5515-2.821-3.375-4.157-0.5003-0.8032-0.9164-1.6954-1.2812-2.7182-0.0313-0.094-0.1249-0.3639-0.2813-0.7813-0.1564-0.4175-0.2812-0.6873-0.3437-0.8437-0.0522-0.1672-0.125-0.4164-0.2188-0.75-0.0224-0.0796-0.0119-0.1433-0.0312-0.2188z" transform="translate(0 1028.4)" fill="#c0392b"/>
 </g>
</svg>

          <h4 className="mt-5 mb-2 font-medium">Phone Number</h4>
          <h3 className="mb-2 text-title-md font-bold text-black dark:text-white">
            {phone}
          </h3>
          <p className="flex items-center justify-between text-sm font-medium">
            {/* <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M13.0155 4.74683H9.49366C9.23116 4.74683 9.01241 4.96558 9.01241 5.22808C9.01241 5.49058 9.23116 5.70933 9.49366 5.70933H11.6593L8.85928 7.59058C8.74991 7.67808 8.59678 7.67808 8.46553 7.59058L5.57803 5.68745C5.11866 5.3812 4.54991 5.3812 4.09053 5.68745L0.721783 7.94058C0.503033 8.0937 0.437408 8.39995 0.590533 8.6187C0.678033 8.74995 0.831157 8.83745 1.00616 8.83745C1.09366 8.83745 1.20303 8.81558 1.26866 8.74995L4.65928 6.49683C4.76866 6.40933 4.92178 6.40933 5.05303 6.49683L7.94053 8.42183C8.39991 8.72808 8.96866 8.72808 9.42803 8.42183L12.5124 6.3437V8.77183C12.5124 9.03433 12.7312 9.25308 12.9937 9.25308C13.2562 9.25308 13.4749 9.03433 13.4749 8.77183V5.22808C13.5187 4.96558 13.278 4.74683 13.0155 4.74683Z"
                fill="#10B981"
              />
            </svg> */}
            {_.get(participantDetails, "communication.phoneVerified") ?
            <span className="text-meta-3">Active</span>:
            <>
            <span className="text-red">Inactive</span> 
            <button onClick={() => verifyResend("phone")} className="text-meta-5 underline">Verify Link</button>
            </>
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default CardDataStatsProfile;
