import{n as P}from"./rolldown-runtime-CqndAUA0.js";import{S as R,a as T,i as z,n as I,o as W,p as A,r as B,t as F}from"./react-vendor-C4mZm-QB.js";import{t as E}from"./index-D-8UQNba.js";var o=P(R()),e=P(A()),D=()=>((0,o.useEffect)(()=>{const r=document.querySelector(".payment-particles");if(!r||r.dataset.ready==="true")return;const n=window.innerWidth<=768?15:30,i=document.createDocumentFragment();return requestAnimationFrame(()=>{for(let a=0;a<n;a++){const p=document.createElement("span");p.className="particle",p.style.left=`${Math.random()*100}vw`,p.style.top=`${Math.random()*100}vh`;const d=1+Math.random()*3;p.style.width=`${d}px`,p.style.height=`${d}px`,p.style.animationDelay=`${Math.random()*10}s`,p.style.animationDuration=`${6+Math.random()*6}s`,p.style.willChange="transform, opacity",i.appendChild(p)}r.appendChild(i),r.dataset.ready="true"}),()=>{r&&(r.innerHTML="",delete r.dataset.ready)}},[]),(0,e.jsxs)(e.Fragment,{children:[(0,e.jsx)("div",{className:"payment-particles","aria-hidden":"true"}),(0,e.jsx)("style",{children:`
        .payment-particles {
          position: fixed;
          inset: 0;
          overflow: hidden;
          z-index: 0;
          pointer-events: none;
        }

        .particle {
          position: absolute;
          border-radius: 50%;
          background: rgba(0, 255, 222, 0.8);
          box-shadow: 0 0 8px rgba(0, 255, 222, 0.4);
          opacity: 0.6;
          animation: floatUp linear infinite, flicker ease-in-out infinite;
          will-change: transform, opacity;
          transform: translateZ(0); /* GPU acceleration */
          backface-visibility: hidden;
        }

        @media (prefers-reduced-motion: reduce) {
          .particle {
            animation: none;
            opacity: 0.4;
          }
        }

        @media (max-width: 768px) {
          .particle {
            box-shadow: 0 0 4px rgba(0, 255, 222, 0.3);
          }
        }

        @keyframes floatUp {
          0% {
            transform: translateY(0) translateX(0);
          }
          50% {
            transform: translateY(-20vh) translateX(2vw);
          }
          100% {
            transform: translateY(-40vh) translateX(-2vw);
          }
        }

        @keyframes flicker {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 0.9; }
        }

        @media (prefers-reduced-motion: reduce) {
          .particle { animation: none; }
        }
      `})]})),C=D,H=(0,o.memo)(({webinarData:r,onPaymentSuccess:n,onPaymentError:i})=>{const x=W(),a=T(),[p,d]=(0,o.useState)(!1),[u,b]=(0,o.useState)(null),[h,f]=(0,o.useState)("16px"),[y,t]=(0,o.useState)(""),[m,j]=(0,o.useState)(0),v=3;(0,o.useEffect)(()=>{const g=()=>{const l=window.innerWidth;l<=360?f("13px"):l<=420?f("14px"):l<=768?f("15px"):f("16px")};return g(),window.addEventListener("resize",g),()=>window.removeEventListener("resize",g)},[]);const S=async g=>{if(g.preventDefault(),!x||!a){b("Stripe has not loaded yet. Please wait.");return}d(!0),b(null),t("");try{t("Verifying card details...");const l=x.confirmCardPayment(r.clientSecret,{payment_method:{card:a.getElement(z)}}),c=new Promise((V,M)=>{setTimeout(()=>M(new Error("Payment timeout. Please try again.")),3e5)}),{error:s,paymentIntent:k}=await Promise.race([l,c]);if(s)throw s.type==="card_error"?new Error(s.message||"Card payment failed. Please check your card details."):s.type==="validation_error"?new Error("Invalid card details. Please check and try again."):s.type==="authentication_error"?new Error("3D Secure authentication failed. Please try again."):new Error(s.message||"Payment failed. Please try again.");if(k)switch(k.status){case"succeeded":t("Payment successful!"),n(k.id);break;case"processing":t("Payment is processing..."),b("Payment is being processed. Please wait."),d(!1),setTimeout(()=>{n(k.id)},2e3);break;case"requires_action":case"requires_source_action":t("Please complete authentication in the popup window...");break;case"requires_payment_method":throw new Error("Payment failed. Please try a different card.");case"canceled":throw new Error("Payment was cancelled.");default:throw new Error(`Unexpected payment status: ${k.status}`)}else throw new Error("Payment not completed")}catch(l){const c=l.message||"Payment failed";let s=c;c.includes("declined")||c.includes("card_error")?s="Your card was declined. Please check your card details or try a different card.":c.includes("insufficient")?s="Insufficient funds. Please use a different payment method.":c.includes("authentication")||c.includes("3D Secure")?s="3D Secure authentication failed. Please try again.":c.includes("timeout")?s="Payment timeout. Please check your connection and try again.":(c.includes("network")||c.includes("fetch"))&&(s="Network error. Please check your internet connection and try again."),b(s),t(""),i&&i(s),d(!1)}},w={style:{base:{fontSize:h,color:"#fff",fontFamily:"Arial, sans-serif","::placeholder":{color:"rgba(159,236,226,0.5)"},lineHeight:"1.4"},invalid:{color:"#ff6b6b",iconColor:"#ff6b6b"}},hidePostalCode:!1};return(0,e.jsxs)("div",{className:"payment-card-wrapper",children:[(0,e.jsx)("h2",{className:"pc-title",children:r.title}),(0,e.jsxs)("div",{className:"pc-price-row",children:[(0,e.jsx)("span",{children:"Amount"}),(0,e.jsxs)("span",{className:"pc-amount",children:["$",r.price]})]}),(0,e.jsxs)("div",{className:"secure-auth-info",children:[(0,e.jsxs)("svg",{width:"18",height:"18",viewBox:"0 0 24 24",fill:"none","aria-hidden":!0,children:[(0,e.jsx)("path",{d:"M12 2L2 7L12 12L22 7L12 2Z",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"}),(0,e.jsx)("path",{d:"M2 17L12 22L22 17",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"}),(0,e.jsx)("path",{d:"M2 12L12 17L22 12",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"})]}),(0,e.jsxs)("div",{children:[(0,e.jsx)("strong",{children:"Secure Payment with 3D Secure"}),(0,e.jsx)("p",{children:"You may be asked to verify this payment with your bank via OTP/SMS"})]})]}),(0,e.jsxs)("form",{onSubmit:S,children:[(0,e.jsxs)("div",{className:"card-input-box","aria-label":"Card details",children:[(0,e.jsx)("label",{className:"card-label",children:"Card Details"}),(0,e.jsx)("div",{className:"card-element-container",children:(0,e.jsx)(z,{options:w})})]}),y&&(0,e.jsxs)("div",{className:"auth-status",role:"status",children:[(0,e.jsx)("span",{className:"spinner-small","aria-hidden":!0}),y]}),u&&(0,e.jsxs)("div",{className:"pc-error",role:"alert",children:[u,m<v&&u&&!u.includes("timeout")&&(0,e.jsxs)("button",{type:"button",onClick:g=>{g.preventDefault(),b(null),j(l=>l+1),S({preventDefault:()=>{}})},className:"retry-btn",style:{marginTop:"8px",padding:"6px 12px",background:"rgba(0,255,222,0.2)",border:"1px solid rgba(0,255,222,0.4)",borderRadius:"6px",color:"#00ffde",cursor:"pointer",fontSize:"12px",fontWeight:"600"},children:["Retry Payment (",v-m," attempts left)"]})]}),(0,e.jsx)("button",{type:"submit",disabled:!x||p||m>=v,className:"pay-btn",children:p?(0,e.jsxs)("span",{className:"processing",children:[(0,e.jsx)("span",{className:"spinner","aria-hidden":!0}),"PROCESSING PAYMENT..."]}):m>=v?"MAX RETRIES REACHED":"PAY SECURELY"})]}),(0,e.jsxs)("div",{className:"pc-secure",children:[(0,e.jsxs)("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none","aria-hidden":!0,children:[(0,e.jsx)("rect",{x:"3",y:"11",width:"18",height:"11",rx:"2",stroke:"currentColor",strokeWidth:"2"}),(0,e.jsx)("path",{d:"M7 11V7C7 4.79086 8.79086 3 11 3H13C15.2091 3 17 4.79086 17 7V11",stroke:"currentColor",strokeWidth:"2"})]}),(0,e.jsx)("span",{children:"Protected by Stripe & 3D Secure authentication"})]}),(0,e.jsx)("style",{children:`
        .payment-card-wrapper {
          background: rgba(6,20,22,0.90);
          border: 1px solid rgba(0,255,222,0.25);
          border-radius: 16px;
          padding: 28px;
          box-shadow: 0 24px 60px rgba(0,0,0,0.4), 0 8px 24px rgba(0,255,222,0.12) inset;
          margin-bottom: 32px;
          backdrop-filter: blur(10px);
        }

        .pc-title {
          color: #ccfff7;
          font-size: 20px;
          margin: 0 0 18px;
          text-align: center;
        }

        .pc-price-row {
          display:flex;
          justify-content:space-between;
          align-items:center;
          padding-bottom:12px;
          margin-bottom:16px;
          border-bottom:1px solid rgba(0,255,222,0.12);
          color: #9fece2;
        }
        .pc-amount { color: #fff; font-size: 28px; font-weight:700; }

        /* ✅ 3D Secure Info Banner */
        .secure-auth-info {
          display: flex;
          gap: 12px;
          background: rgba(0,255,222,0.08);
          border: 1px solid rgba(0,255,222,0.2);
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 18px;
          color: #9fece2;
          font-size: 13px;
          line-height: 1.4;
        }
        .secure-auth-info svg {
          flex-shrink: 0;
          margin-top: 2px;
          color: #00ffde;
        }
        .secure-auth-info strong {
          display: block;
          color: #ccfff7;
          margin-bottom: 4px;
        }
        .secure-auth-info p {
          margin: 0;
          opacity: 0.85;
        }

        .card-input-box {
          background: rgba(0,0,0,0.3);
          border: 1px solid rgba(0,255,222,0.12);
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 18px;
          box-sizing: border-box;
        }
        .card-label {
          display:block;
          color:#9fece2;
          font-size:13px;
          margin-bottom:8px;
          font-weight:500;
        }

        .card-element-container {
          width:100%;
          box-sizing: border-box;
          background: transparent;
          padding: 8px 6px;
          border-radius: 6px;
        }

        /* ✅ Authentication status indicator */
        .auth-status {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(0,255,222,0.08);
          border: 1px solid rgba(0,255,222,0.2);
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 12px;
          color: #00ffde;
          font-size: 14px;
          font-weight: 500;
        }

        .spinner-small {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(0,255,222,0.2);
          border-top-color: #00ffde;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        .pc-error {
          background: rgba(255,0,0,0.06);
          border: 1px solid rgba(255,0,0,0.16);
          border-radius: 8px;
          padding: 10px;
          margin-bottom: 12px;
          color: #ff6b6b;
          font-size: 13px;
        }

        .pay-btn {
          width:100%;
          background: #00ffde;
          color:#000;
          border:none;
          padding:14px 18px;
          font-size:15px;
          font-weight:700;
          border-radius:8px;
          cursor:pointer;
          text-transform:uppercase;
          letter-spacing:0.04em;
          box-shadow:0 4px 20px rgba(0,255,222,0.26);
          transition:transform .18s ease, box-shadow .18s ease;
        }
        .pay-btn:disabled { opacity:0.7; cursor:not-allowed; }
        .pay-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow:0 8px 30px rgba(0,255,222,0.35); }

        .pc-secure {
          display:flex;
          align-items:center;
          justify-content:center;
          gap:8px;
          color: rgba(159,236,226,0.6);
          font-size:12px;
          margin-top:12px;
        }

        .processing { display:flex; align-items:center; justify-content:center; gap:8px; }
        .spinner { width:16px; height:16px; border:2px solid rgba(0,0,0,0.18); border-top-color:#000; border-radius:50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform:rotate(360deg); } }

        @media (max-width: 768px) {
          .payment-card-wrapper { padding: 20px; border-radius: 14px; }
          .pc-title { font-size: 18px; }
          .pc-amount { font-size: 24px; }
          .secure-auth-info { font-size: 12px; padding: 10px; gap: 10px; }
          .card-input-box { padding: 12px; }
          .pay-btn { padding: 14px 16px; font-size: 14px; min-height: 48px; }
        }

        @media (max-width: 480px) {
          .payment-card-wrapper { padding: 16px; border-radius: 12px; }
          .pc-title { font-size: 16px; margin-bottom: 14px; }
          .pc-amount { font-size: 22px; }
          .secure-auth-info { font-size: 11px; padding: 10px; gap: 8px; }
          .secure-auth-info svg { width: 16px; height: 16px; }
          .card-input-box { padding: 10px; }
          .card-label { font-size: 12px; }
          .pay-btn { 
            padding: 14px 16px; 
            font-size: 13px; 
            min-height: 48px;
            touch-action: manipulation;
          }
          .pc-secure { font-size: 11px; }
        }

        @media (max-width: 360px) {
          .payment-card-wrapper { padding: 14px; }
          .pc-title { font-size: 15px; }
          .pc-amount { font-size: 20px; }
        }
      `})]})});H.displayName="PaymentCard";var L=(0,o.memo)(()=>(0,e.jsxs)("div",{style:{background:"rgba(6,20,22,0.92)",border:"1px solid rgba(0,255,222,0.12)",borderRadius:"16px",padding:"28px",boxShadow:"0 16px 40px rgba(0,0,0,0.3), 0 0 0 1px rgba(0,255,222,0.03) inset",backdropFilter:"blur(12px)"},children:[(0,e.jsx)("h3",{style:{color:"#ccfff7",fontSize:"17px",fontWeight:"600",margin:"0 0 10px",letterSpacing:"0.02em"},children:"Need Help?"}),(0,e.jsx)("p",{style:{color:"rgba(159,236,226,0.6)",margin:"0 0 20px",fontSize:"14px",lineHeight:"1.5"},children:"Questions about the webinar? Our team is here to help."}),(0,e.jsxs)("div",{style:{display:"flex",flexDirection:"column",gap:"10px"},children:[(0,e.jsxs)("a",{href:"mailto:contact@silentequity.com",style:{display:"flex",alignItems:"center",gap:"12px",background:"rgba(0,0,0,0.2)",border:"1px solid rgba(0,255,222,0.12)",borderRadius:"10px",padding:"12px 14px",color:"#9fece2",textDecoration:"none",transition:"all 0.25s ease",fontSize:"14px"},onMouseEnter:r=>{r.currentTarget.style.borderColor="rgba(0,255,222,0.3)",r.currentTarget.style.background="rgba(0,255,222,0.06)"},onMouseLeave:r=>{r.currentTarget.style.borderColor="rgba(0,255,222,0.12)",r.currentTarget.style.background="rgba(0,0,0,0.2)"},children:[(0,e.jsx)(I,{style:{width:"18px",height:"18px",color:"#00ffde",flexShrink:0}}),(0,e.jsx)("span",{children:"unmask@thesilentequity.com"})]}),(0,e.jsxs)("a",{href:"tel:+1234567890",style:{display:"flex",alignItems:"center",gap:"12px",background:"rgba(0,0,0,0.2)",border:"1px solid rgba(0,255,222,0.12)",borderRadius:"10px",padding:"12px 14px",color:"#9fece2",textDecoration:"none",transition:"all 0.25s ease",fontSize:"14px"},onMouseEnter:r=>{r.currentTarget.style.borderColor="rgba(0,255,222,0.3)",r.currentTarget.style.background="rgba(0,255,222,0.06)"},onMouseLeave:r=>{r.currentTarget.style.borderColor="rgba(0,255,222,0.12)",r.currentTarget.style.background="rgba(0,0,0,0.2)"},children:[(0,e.jsx)(F,{style:{width:"18px",height:"18px",color:"#00ffde",flexShrink:0}}),(0,e.jsx)("span",{children:"+971547731813"})]})]})]}));L.displayName="ContactInfo";var N=(0,o.memo)(({onDashboard:r=()=>E.debug("Dashboard clicked")})=>(0,e.jsxs)("div",{style:{display:"flex",justifyContent:"center",minHeight:"10vh",padding:"20px",position:"relative",zIndex:1},children:[(0,e.jsx)("style",{children:`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes scaleIn {
          from {
            transform: scale(0);
          }
          to {
            transform: scale(1);
          }
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.9;
          }
        }

        @keyframes glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(0,255,222,0.3), 0 0 40px rgba(0,255,222,0.2);
          }
          50% {
            box-shadow: 0 0 30px rgba(0,255,222,0.5), 0 0 60px rgba(0,255,222,0.3);
          }
        }
      `}),(0,e.jsxs)("div",{style:{maxWidth:"500px",width:"100%",background:"rgba(6,20,22,0.92)",border:"1px solid rgba(0,255,222,0.18)",borderRadius:"16px",padding:"22px 24px",boxShadow:"0 24px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(0,255,222,0.05) inset",textAlign:"center",backdropFilter:"blur(12px)",animation:"fadeInScale 0.5s cubic-bezier(0.4, 0, 0.2, 1)"},children:[(0,e.jsx)("div",{style:{display:"inline-flex",alignItems:"center",justifyContent:"center",width:"80px",height:"80px",background:"rgba(0,255,222,0.12)",borderRadius:"50%",marginBottom:"24px",animation:"scaleIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s backwards"},children:(0,e.jsx)(B,{style:{width:"44px",height:"44px",color:"#00ffde"}})}),(0,e.jsx)("h1",{style:{fontSize:"clamp(24px, 6vw, 36px)",margin:"0 0 16px",color:"#fff",fontWeight:"700",textTransform:"uppercase",letterSpacing:"0.05em",lineHeight:"1.2"},children:"PAYMENT SUCCESSFUL!"}),(0,e.jsx)("p",{style:{color:"#9fece2",fontSize:"clamp(14px, 3.5vw, 15px)",margin:"0 0 32px",lineHeight:"1.6"},children:"Your payment has been processed successfully. Your spot in the webinar is now confirmed."}),(0,e.jsxs)("div",{style:{background:"linear-gradient(135deg, rgba(0,255,222,0.15) 0%, rgba(0,212,184,0.12) 100%)",border:"2px solid rgba(0,255,222,0.4)",borderRadius:"12px",padding:"24px 16px",marginBottom:"28px",animation:"glow 2s ease-in-out infinite",position:"relative",overflow:"hidden"},children:[(0,e.jsx)("div",{style:{position:"absolute",top:0,left:0,right:0,bottom:0,background:"radial-gradient(circle at center, rgba(0,255,222,0.1) 0%, transparent 70%)",animation:"pulse 3s ease-in-out infinite",pointerEvents:"none"}}),(0,e.jsx)("div",{style:{display:"inline-flex",alignItems:"center",justifyContent:"center",width:"56px",height:"56px",background:"rgba(0,255,222,0.15)",borderRadius:"50%",marginBottom:"16px",position:"relative"},children:(0,e.jsx)(I,{style:{width:"28px",height:"28px",color:"#00ffde"}})}),(0,e.jsx)("h3",{style:{color:"#00ffde",fontSize:"clamp(16px, 4.5vw, 22px)",fontWeight:"700",margin:"0 0 12px",letterSpacing:"0.02em",textTransform:"uppercase",lineHeight:"1.3",position:"relative"},children:"CHECK YOUR EMAIL"}),(0,e.jsxs)("p",{style:{color:"#9fece2",fontSize:"clamp(13px, 3.5vw, 15px)",margin:"0",lineHeight:"1.5",position:"relative"},children:["You'll receive a receipt and a ",(0,e.jsx)("strong",{style:{color:"#00ffde"},children:"verification form link"}),". Complete the form to finalize your registration."]})]}),(0,e.jsxs)("div",{style:{background:"rgba(255,193,7,0.1)",border:"2px solid rgba(255,193,7,0.3)",borderRadius:"12px",padding:"20px 16px",marginBottom:"24px"},children:[(0,e.jsx)("p",{style:{color:"#ffc107",fontSize:"clamp(13px, 3.5vw, 15px)",margin:"0 0 12px",fontWeight:"600"},children:"⚠️ ACTION REQUIRED"}),(0,e.jsx)("p",{style:{color:"#fff",fontSize:"clamp(12px, 3vw, 14px)",margin:"0 0 16px",lineHeight:"1.5"},children:"Complete the verification form in your email to receive Discord access."}),(0,e.jsx)("a",{href:"https://docs.google.com/forms/d/e/1FAIpQLScxS_5gOlOif-wuXM8JFgnac1gQC9hqLBb9EWLAKmszFKNDxg/viewform?usp=publish-editor",target:"_blank",rel:"noopener noreferrer",style:{display:"inline-block",background:"#ffc107",color:"#000",padding:"12px 24px",borderRadius:"8px",textDecoration:"none",fontWeight:"700",fontSize:"14px",transition:"all 0.2s"},children:"📝 OPEN VERIFICATION FORM"})]}),(0,e.jsx)("div",{style:{background:"rgba(0,0,0,0.2)",border:"1px solid rgba(0,255,222,0.1)",borderRadius:"10px",padding:"14px 12px",marginBottom:"24px"},children:(0,e.jsx)("p",{style:{color:"rgba(159,236,226,0.7)",fontSize:"clamp(11px, 3vw, 12px)",margin:"0",lineHeight:"1.5"},children:"📧 Check your email (and spam folder) for receipt and verification form link."})})]})]}));N.displayName="SuccessScreen";var U=N,_=(0,o.memo)(({onSubmit:r,isLoading:n})=>{const[i,x]=(0,o.useState)({name:"",email:"",phone:""}),[a,p]=(0,o.useState)({}),[d,u]=(0,o.useState)({}),b=t=>{const{name:m,value:j}=t.target;x(v=>({...v,[m]:j})),a[m]&&p(v=>({...v,[m]:""}))},h=t=>{u(m=>({...m,[t]:!0}))},f=()=>{const t={};i.name.trim()?i.name.trim().length<2&&(t.name="Name must be at least 2 characters"):t.name="Name is required";const m=/^\S+@\S+\.\S+$/;i.email.trim()?m.test(i.email)||(t.email="Invalid email format"):t.email="Email is required";const j=/^[0-9+\-\s()]{10,}$/;return i.phone.trim()?j.test(i.phone)||(t.phone="Invalid phone number"):t.phone="Phone number is required",p(t),Object.keys(t).length===0},y=t=>{t.preventDefault(),u({name:!0,email:!0,phone:!0}),f()&&r(i)};return(0,e.jsx)("form",{onSubmit:y,style:{marginBottom:"20px"},children:(0,e.jsxs)("div",{style:{background:"rgba(6,20,22,0.92)",border:"1px solid rgba(0,255,222,0.18)",borderRadius:"16px",padding:"10px 28px",boxShadow:"0 20px 50px rgba(0,0,0,0.4), 0 0 0 1px rgba(0,255,222,0.05) inset",backdropFilter:"blur(12px)"},children:[(0,e.jsxs)("div",{style:{marginBottom:"10px",textAlign:"center"},children:[(0,e.jsx)("h3",{style:{color:"#ccfff7",fontSize:"20px",fontWeight:"700",margin:"0 0 6px",letterSpacing:"0.02em"},children:"Your Information"}),(0,e.jsx)("p",{style:{color:"rgba(159,236,226,0.6)",fontSize:"13px",margin:0},children:"Please provide your details to continue"})]}),(0,e.jsxs)("div",{style:{marginBottom:"16px"},children:[(0,e.jsx)("label",{htmlFor:"name",style:{display:"block",color:"#9fece2",fontSize:"13px",marginBottom:"8px",fontWeight:"500",letterSpacing:"0.02em"},children:"Full Name *"}),(0,e.jsx)("input",{type:"text",id:"name",name:"name",value:i.name,onChange:b,onBlur:()=>h("name"),placeholder:"Enter your full name",disabled:n,autoComplete:"name",maxLength:100,style:{width:"100%",padding:"clamp(12px, 3vw, 14px) clamp(14px, 3.5vw, 16px)",background:"rgba(0,0,0,0.25)",border:`1px solid ${a.name&&d.name?"rgba(255,100,100,0.4)":"rgba(0,255,222,0.15)"}`,borderRadius:"10px",color:"#fff",fontSize:"clamp(14px, 3.5vw, 16px)",outline:"none",transition:"all 0.25s ease",fontFamily:"inherit",minHeight:"44px",boxSizing:"border-box",touchAction:"manipulation"},onFocus:t=>{a.name||(t.target.style.borderColor="rgba(0,255,222,0.4)"),t.target.style.background="rgba(0,0,0,0.35)"},onBlurCapture:t=>{a.name||(t.target.style.borderColor="rgba(0,255,222,0.15)"),t.target.style.background="rgba(0,0,0,0.25)"}}),a.name&&d.name&&(0,e.jsxs)("div",{style:{color:"#ff6b6b",fontSize:"11px",marginTop:"6px",display:"flex",alignItems:"center",gap:"5px"},children:[(0,e.jsxs)("svg",{width:"12",height:"12",viewBox:"0 0 24 24",fill:"none",children:[(0,e.jsx)("circle",{cx:"12",cy:"12",r:"10",stroke:"currentColor",strokeWidth:"2"}),(0,e.jsx)("path",{d:"M12 8V12M12 16H12.01",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})]}),a.name]})]}),(0,e.jsxs)("div",{style:{marginBottom:"16px"},children:[(0,e.jsx)("label",{htmlFor:"email",style:{display:"block",color:"#9fece2",fontSize:"13px",marginBottom:"8px",fontWeight:"500",letterSpacing:"0.02em"},children:"Email Address *"}),(0,e.jsx)("input",{type:"email",id:"email",name:"email",value:i.email,onChange:b,onBlur:()=>h("email"),placeholder:"your.email@example.com",disabled:n,autoComplete:"email",inputMode:"email",maxLength:255,style:{width:"100%",padding:"clamp(12px, 3vw, 14px) clamp(14px, 3.5vw, 16px)",background:"rgba(0,0,0,0.25)",border:`1px solid ${a.email&&d.email?"rgba(255,100,100,0.4)":"rgba(0,255,222,0.15)"}`,borderRadius:"10px",color:"#fff",fontSize:"clamp(14px, 3.5vw, 16px)",outline:"none",transition:"all 0.25s ease",fontFamily:"inherit",minHeight:"44px",boxSizing:"border-box",touchAction:"manipulation"},onFocus:t=>{a.email||(t.target.style.borderColor="rgba(0,255,222,0.4)"),t.target.style.background="rgba(0,0,0,0.35)"},onBlurCapture:t=>{a.email||(t.target.style.borderColor="rgba(0,255,222,0.15)"),t.target.style.background="rgba(0,0,0,0.25)"}}),a.email&&d.email&&(0,e.jsxs)("div",{style:{color:"#ff6b6b",fontSize:"11px",marginTop:"6px",display:"flex",alignItems:"center",gap:"5px"},children:[(0,e.jsxs)("svg",{width:"12",height:"12",viewBox:"0 0 24 24",fill:"none",children:[(0,e.jsx)("circle",{cx:"12",cy:"12",r:"10",stroke:"currentColor",strokeWidth:"2"}),(0,e.jsx)("path",{d:"M12 8V12M12 16H12.01",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})]}),a.email]})]}),(0,e.jsxs)("div",{style:{marginBottom:"20px"},children:[(0,e.jsx)("label",{htmlFor:"phone",style:{display:"block",color:"#9fece2",fontSize:"13px",marginBottom:"8px",fontWeight:"500",letterSpacing:"0.02em"},children:"Phone Number *"}),(0,e.jsx)("input",{type:"tel",id:"phone",name:"phone",value:i.phone,onChange:b,onBlur:()=>h("phone"),placeholder:"+1 (234) 567-8900",disabled:n,autoComplete:"tel",inputMode:"tel",maxLength:20,style:{width:"100%",padding:"clamp(12px, 3vw, 14px) clamp(14px, 3.5vw, 16px)",background:"rgba(0,0,0,0.25)",border:`1px solid ${a.phone&&d.phone?"rgba(255,100,100,0.4)":"rgba(0,255,222,0.15)"}`,borderRadius:"10px",color:"#fff",fontSize:"clamp(14px, 3.5vw, 16px)",outline:"none",transition:"all 0.25s ease",fontFamily:"inherit",minHeight:"44px",boxSizing:"border-box",touchAction:"manipulation"},onFocus:t=>{a.phone||(t.target.style.borderColor="rgba(0,255,222,0.4)"),t.target.style.background="rgba(0,0,0,0.35)"},onBlurCapture:t=>{a.phone||(t.target.style.borderColor="rgba(0,255,222,0.15)"),t.target.style.background="rgba(0,0,0,0.25)"}}),a.phone&&d.phone&&(0,e.jsxs)("div",{style:{color:"#ff6b6b",fontSize:"11px",marginTop:"6px",display:"flex",alignItems:"center",gap:"5px"},children:[(0,e.jsxs)("svg",{width:"12",height:"12",viewBox:"0 0 24 24",fill:"none",children:[(0,e.jsx)("circle",{cx:"12",cy:"12",r:"10",stroke:"currentColor",strokeWidth:"2"}),(0,e.jsx)("path",{d:"M12 8V12M12 16H12.01",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})]}),a.phone]})]}),(0,e.jsx)("button",{type:"submit",disabled:n,style:{width:"100%",background:n?"rgba(0,255,222,0.3)":"linear-gradient(135deg, #00ffde 0%, #00d4b8 100%)",color:"#000",border:"none",padding:"clamp(14px, 3.5vw, 16px) clamp(20px, 5vw, 28px)",fontSize:"clamp(13px, 3.2vw, 14px)",fontWeight:"700",borderRadius:"10px",cursor:n?"not-allowed":"pointer",textTransform:"uppercase",letterSpacing:"0.08em",transition:"all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",boxShadow:n?"none":"0 8px 24px rgba(0,255,222,0.25)",transform:"translateZ(0)",willChange:"transform",minHeight:"48px",touchAction:"manipulation",WebkitTapHighlightColor:"transparent"},onMouseEnter:t=>{n||(t.currentTarget.style.transform="translateY(-2px)",t.currentTarget.style.boxShadow="0 12px 32px rgba(0,255,222,0.35)")},onMouseLeave:t=>{n||(t.currentTarget.style.transform="translateY(0)",t.currentTarget.style.boxShadow="0 8px 24px rgba(0,255,222,0.25)")},children:n?(0,e.jsxs)("span",{style:{display:"flex",alignItems:"center",justifyContent:"center",gap:"10px"},children:[(0,e.jsx)("span",{style:{width:"16px",height:"16px",border:"2px solid rgba(0,0,0,0.2)",borderTopColor:"#000",borderRadius:"50%",animation:"spin 0.7s linear infinite"}}),"PROCESSING..."]}):"CONTINUE TO PAYMENT"}),(0,e.jsx)("p",{style:{color:"rgba(159,236,226,0.45)",fontSize:"11px",margin:"12px 0 0",textAlign:"center",lineHeight:"1.4"},children:"🔒 Your information is secure and encrypted. We never share your data."})]})})});_.displayName="UserDetailsForm";var $=(0,o.memo)(({selectedMethod:r,onMethodChange:n,isLoading:i})=>(0,e.jsxs)("div",{className:"payment-method-selector",children:[(0,e.jsx)("label",{className:"method-selector-label",children:"Select Payment Method"}),(0,e.jsxs)("div",{className:"method-options",children:[(0,e.jsxs)("label",{className:`method-option ${r==="card"?"active":""}`,children:[(0,e.jsx)("input",{type:"radio",name:"paymentMethod",value:"card",checked:r==="card",onChange:x=>n(x.target.value),disabled:i}),(0,e.jsxs)("div",{className:"method-option-content",children:[(0,e.jsxs)("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none","aria-hidden":!0,children:[(0,e.jsx)("rect",{x:"2",y:"6",width:"20",height:"14",rx:"2",stroke:"currentColor",strokeWidth:"2"}),(0,e.jsx)("path",{d:"M2 10H22",stroke:"currentColor",strokeWidth:"2"})]}),(0,e.jsx)("span",{children:"Credit / Debit Card"})]})]}),(0,e.jsxs)("label",{className:`method-option ${r==="upi"?"active":""}`,children:[(0,e.jsx)("input",{type:"radio",name:"paymentMethod",value:"upi",checked:r==="upi",onChange:x=>n(x.target.value),disabled:i}),(0,e.jsxs)("div",{className:"method-option-content",children:[(0,e.jsxs)("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none","aria-hidden":!0,children:[(0,e.jsx)("rect",{x:"3",y:"6",width:"18",height:"12",rx:"2",stroke:"currentColor",strokeWidth:"2"}),(0,e.jsx)("path",{d:"M8 12H16",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})]}),(0,e.jsx)("span",{children:"UPI"})]})]})]}),(0,e.jsx)("style",{children:`
        .payment-method-selector {
          background: rgba(6,20,22,0.90);
          border: 1px solid rgba(0,255,222,0.25);
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 24px;
        }

        .method-selector-label {
          display: block;
          color: #9fece2;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 12px;
        }

        .method-options {
          display: flex;
          gap: 12px;
        }

        .method-option {
          flex: 1;
          position: relative;
          cursor: pointer;
        }

        .method-option input[type="radio"] {
          position: absolute;
          opacity: 0;
          width: 0;
          height: 0;
        }

        .method-option-content {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 16px;
          background: rgba(0,0,0,0.3);
          border: 2px solid rgba(0,255,222,0.15);
          border-radius: 10px;
          color: #9fece2;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .method-option input[type="radio"]:checked + .method-option-content,
        .method-option.active .method-option-content {
          background: rgba(0,255,222,0.1);
          border-color: rgba(0,255,222,0.4);
          color: #00ffde;
        }

        .method-option:hover:not(:has(input:disabled)) .method-option-content {
          border-color: rgba(0,255,222,0.3);
          background: rgba(0,0,0,0.4);
        }

        .method-option input[type="radio"]:disabled + .method-option-content {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .method-option svg {
          flex-shrink: 0;
        }

        @media (max-width: 480px) {
          .method-options {
            flex-direction: column;
            gap: 10px;
          }
          .method-option-content {
            padding: 12px 14px;
            font-size: 13px;
          }
        }
      `})]}));$.displayName="PaymentMethodSelector";var Y=(0,o.memo)(({webinarData:r,onPaymentSuccess:n,onPaymentError:i,apiBaseUrl:x})=>{const[a,p]=(0,o.useState)(""),[d,u]=(0,o.useState)(!1),[b,h]=(0,o.useState)(null),[f,y]=(0,o.useState)(""),[t,m]=(0,o.useState)(""),j=w=>/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(w.trim()),v=w=>{const g=w.target.value.trim();p(g),y(""),h(null)},S=async w=>{if(w.preventDefault(),h(null),y(""),!a.trim()){y("UPI ID is required");return}if(!j(a)){y("Invalid UPI ID format. Example: yourname@paytm or 9876543210@ybl");return}u(!0);try{const g=await fetch(`${x}/payment/create-upi-intent`,{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify({upiId:a.trim(),amount:r.price,...r.userDetails})});if(!g.ok){const c=await g.json().catch(()=>({message:"Network error"}));throw new Error(c.message||"Failed to create UPI payment")}const l=await g.json();if(!l.success)throw new Error(l.message||"Failed to create UPI payment");if(l.paymentLink&&l.requiresRedirect)m("Redirecting to payment page..."),setTimeout(()=>{window.location.href=l.paymentLink},500);else if(l.clientSecret){m("Processing UPI payment...");const c=setInterval(async()=>{try{const s=await(await fetch(`${x}/payment/status?paymentIntentId=${l.paymentIntentId}`)).json();if(s.success&&s.status==="succeeded")clearInterval(c),n(l.paymentIntentId);else if(s.success&&(s.status==="failed"||s.status==="canceled"))throw clearInterval(c),new Error("Payment failed or was cancelled")}catch(s){throw clearInterval(c),s}},2e3);setTimeout(()=>{clearInterval(c)},3e5)}else throw new Error("Invalid payment response")}catch(g){const l=g.message||"UPI payment failed. Please try again.";h(l),i&&i(l)}finally{u(!1)}};return(0,e.jsxs)("div",{className:"upi-payment-wrapper",children:[(0,e.jsx)("h2",{className:"upi-title",children:r.title}),(0,e.jsxs)("div",{className:"upi-price-row",children:[(0,e.jsx)("span",{children:"Amount"}),(0,e.jsxs)("span",{className:"upi-amount",children:["$",r.price]})]}),(0,e.jsxs)("div",{className:"upi-info",children:[(0,e.jsxs)("svg",{width:"18",height:"18",viewBox:"0 0 24 24",fill:"none","aria-hidden":!0,children:[(0,e.jsx)("circle",{cx:"12",cy:"12",r:"10",stroke:"currentColor",strokeWidth:"2"}),(0,e.jsx)("path",{d:"M12 8V12M12 16H12.01",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})]}),(0,e.jsxs)("div",{children:[(0,e.jsx)("strong",{children:"UPI Payment"}),(0,e.jsx)("p",{children:"Enter your UPI ID to complete the payment"})]})]}),(0,e.jsxs)("form",{onSubmit:S,children:[(0,e.jsxs)("div",{className:"upi-input-box",children:[(0,e.jsx)("label",{htmlFor:"upiId",className:"upi-label",children:"UPI ID"}),(0,e.jsx)("input",{type:"text",id:"upiId",name:"upiId",value:a,onChange:v,placeholder:"yourname@paytm or 9876543210@ybl",disabled:d,autoComplete:"off",inputMode:"email",style:{width:"100%",padding:"clamp(12px, 3vw, 14px) clamp(14px, 3.5vw, 16px)",background:"rgba(0,0,0,0.25)",border:`1px solid ${f?"rgba(255,100,100,0.4)":"rgba(0,255,222,0.15)"}`,borderRadius:"10px",color:"#fff",fontSize:"clamp(14px, 3.5vw, 16px)",outline:"none",transition:"all 0.25s ease",fontFamily:"inherit",minHeight:"44px",boxSizing:"border-box",touchAction:"manipulation"},onFocus:w=>{f||(w.target.style.borderColor="rgba(0,255,222,0.4)")},onBlur:w=>{f||(w.target.style.borderColor="rgba(0,255,222,0.15)")}}),f&&(0,e.jsx)("div",{className:"upi-validation-error",children:f})]}),t&&(0,e.jsxs)("div",{className:"upi-auth-status",role:"status",children:[(0,e.jsx)("span",{className:"spinner-small","aria-hidden":!0}),t]}),b&&(0,e.jsx)("div",{className:"upi-error",role:"alert",children:b}),(0,e.jsx)("button",{type:"submit",disabled:d||!a.trim(),className:"upi-pay-btn",children:d?(0,e.jsxs)("span",{className:"processing",children:[(0,e.jsx)("span",{className:"spinner","aria-hidden":!0}),"PROCESSING..."]}):"PAY WITH UPI"})]}),(0,e.jsxs)("div",{className:"upi-secure",children:[(0,e.jsxs)("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none","aria-hidden":!0,children:[(0,e.jsx)("rect",{x:"3",y:"11",width:"18",height:"11",rx:"2",stroke:"currentColor",strokeWidth:"2"}),(0,e.jsx)("path",{d:"M7 11V7C7 4.79086 8.79086 3 11 3H13C15.2091 3 17 4.79086 17 7V11",stroke:"currentColor",strokeWidth:"2"})]}),(0,e.jsx)("span",{children:"Protected by Stripe secure payment"})]}),(0,e.jsx)("style",{children:`
        .upi-payment-wrapper {
          background: rgba(6,20,22,0.90);
          border: 1px solid rgba(0,255,222,0.25);
          border-radius: 16px;
          padding: 28px;
          box-shadow: 0 24px 60px rgba(0,0,0,0.4), 0 8px 24px rgba(0,255,222,0.12) inset;
          margin-bottom: 32px;
          backdrop-filter: blur(10px);
        }

        .upi-title {
          color: #ccfff7;
          font-size: 20px;
          margin: 0 0 18px;
          text-align: center;
        }

        .upi-price-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 12px;
          margin-bottom: 16px;
          border-bottom: 1px solid rgba(0,255,222,0.12);
          color: #9fece2;
        }

        .upi-amount {
          color: #fff;
          font-size: 28px;
          font-weight: 700;
        }

        .upi-info {
          display: flex;
          gap: 12px;
          background: rgba(0,255,222,0.08);
          border: 1px solid rgba(0,255,222,0.2);
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 18px;
          color: #9fece2;
          font-size: 13px;
          line-height: 1.4;
        }

        .upi-info svg {
          flex-shrink: 0;
          margin-top: 2px;
          color: #00ffde;
        }

        .upi-info strong {
          display: block;
          color: #ccfff7;
          margin-bottom: 4px;
        }

        .upi-info p {
          margin: 0;
          opacity: 0.85;
        }

        .upi-input-box {
          margin-bottom: 18px;
        }

        .upi-label {
          display: block;
          color: #9fece2;
          font-size: 13px;
          margin-bottom: 8px;
          font-weight: 500;
        }

        .upi-validation-error {
          color: #ff6b6b;
          font-size: 11px;
          margin-top: 6px;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .upi-auth-status {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(0,255,222,0.08);
          border: 1px solid rgba(0,255,222,0.2);
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 12px;
          color: #00ffde;
          font-size: 14px;
          font-weight: 500;
        }

        .spinner-small {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(0,255,222,0.2);
          border-top-color: #00ffde;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        .upi-error {
          background: rgba(255,0,0,0.06);
          border: 1px solid rgba(255,0,0,0.16);
          border-radius: 8px;
          padding: 10px;
          margin-bottom: 12px;
          color: #ff6b6b;
          font-size: 13px;
        }

        .upi-pay-btn {
          width: 100%;
          background: #00ffde;
          color: #000;
          border: none;
          padding: 14px 18px;
          font-size: 15px;
          font-weight: 700;
          border-radius: 8px;
          cursor: pointer;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          box-shadow: 0 4px 20px rgba(0,255,222,0.26);
          transition: transform .18s ease, box-shadow .18s ease;
          min-height: 48px;
          touch-action: manipulation;
        }

        .upi-pay-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .upi-pay-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(0,255,222,0.35);
        }

        .upi-secure {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: rgba(159,236,226,0.6);
          font-size: 12px;
          margin-top: 12px;
        }

        .processing {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(0,0,0,0.18);
          border-top-color: #000;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 480px) {
          .upi-payment-wrapper {
            padding: 16px;
            border-radius: 12px;
          }
          .upi-title {
            font-size: 16px;
            margin-bottom: 14px;
          }
          .upi-amount {
            font-size: 22px;
          }
          .upi-info {
            font-size: 11px;
            padding: 10px;
            gap: 8px;
          }
        }
      `})]})});Y.displayName="UPIPayment";var O="http://localhost:5001/api",q=()=>{const[r,n]=(0,o.useState)(!0),[i,x]=(0,o.useState)(null),[a,p]=(0,o.useState)(!1),d=(0,o.useCallback)(()=>{window.location.href="/"},[]);return(0,o.useEffect)(()=>{const u=new URLSearchParams(window.location.search).get("session_id");u?(async()=>{try{const h=new AbortController,f=setTimeout(()=>h.abort(),1e4),y=await fetch(`${O}/payment/verify-session?sessionId=${u}`,{method:"GET",headers:{Accept:"application/json"},signal:h.signal});if(clearTimeout(f),!y.ok)throw new Error("Failed to verify payment");const t=await y.json();t.success&&t.hasPaid?p(!0):x("Payment not completed. Please try again or contact support.")}catch(h){E.error("Error verifying payment",h,{sessionId:u}),setTimeout(()=>{p(!0)},2e3)}finally{n(!1)}})():(n(!1),setTimeout(()=>{window.location.href="/"},2e3))},[]),a&&!r?(0,e.jsxs)("main",{style:{minHeight:"100vh",background:"#000",position:"relative",overflowX:"hidden"},children:[(0,e.jsx)(C,{}),(0,e.jsx)(U,{onDashboard:d})]}):(0,e.jsxs)("main",{style:{minHeight:"100vh",background:"#000",position:"relative",overflowX:"hidden",fontFamily:'-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'},children:[(0,e.jsx)(C,{}),(0,e.jsx)("section",{style:{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100dvh",padding:"clamp(16px, 4vw, 20px)",position:"relative",zIndex:1,width:"100%",boxSizing:"border-box"},children:(0,e.jsxs)("div",{style:{maxWidth:"600px",width:"100%",textAlign:"center"},children:[r&&(0,e.jsx)("div",{style:{background:"rgba(6,20,22,0.90)",border:"1px solid rgba(0,255,222,0.25)",borderRadius:"16px",padding:"40px",color:"#9fece2"},children:(0,e.jsx)("p",{style:{margin:0,fontSize:"18px"},children:"Verifying your payment..."})}),i&&!r&&(0,e.jsxs)("div",{style:{background:"rgba(255,0,0,0.06)",border:"1px solid rgba(255,0,0,0.16)",borderRadius:"16px",padding:"40px",color:"#ff6b6b"},children:[(0,e.jsx)("p",{style:{margin:0,fontSize:"16px",marginBottom:"20px"},children:i}),(0,e.jsx)("button",{onClick:()=>window.location.href="/",style:{background:"#00ffde",color:"#000",border:"none",padding:"12px 24px",borderRadius:"8px",fontSize:"16px",fontWeight:"600",cursor:"pointer"},children:"Go to Home"})]}),!r&&!i&&!a&&(0,e.jsx)("div",{style:{background:"rgba(6,20,22,0.90)",border:"1px solid rgba(0,255,222,0.25)",borderRadius:"16px",padding:"40px",color:"#9fece2"},children:(0,e.jsx)("p",{style:{margin:0,fontSize:"16px"},children:"Redirecting to home page..."})})]})}),(0,e.jsx)("style",{children:`
        .page-header {
          display: grid;
          grid-template-columns: min-content 1fr min-content;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
          padding: 6px 4px;
        }
        .header-left { display: flex; align-items: center; justify-content: flex-start; }
        .header-center { text-align: center; }
        .header-right { width: 48px; }

        .page-title {
          font-size: clamp(28px, 6.5vw, 48px);
          margin: 0 0 6px;
          color: #fff;
          font-weight: 700;
          text-transform: uppercase;
          line-height: 1.05;
        }
        .page-sub {
          margin: 0;
          color: #9fece2;
          font-size: 15px;
        }
        .back-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(0,0,0,0.35);
          border: 1px solid rgba(0,255,222,0.12);
          color: #00ffde;
          padding: 8px 12px;
          border-radius: 10px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          transition: all .12s ease;
        }
        .back-btn:focus { outline: 2px solid rgba(0,255,222,0.28); outline-offset: 2px; }
        .back-label { color: #bff6ea; display: inline-block; }

        @media (max-width: 768px) {
          .page-header { gap: 8px; padding: 4px 2px; }
          .page-title { font-size: clamp(24px, 8vw, 36px); }
          .page-sub { font-size: 14px; }
        }

        @media (max-width: 480px) {
          .back-label { display: none; }
          .back-btn { 
            padding: 10px; 
            border-radius: 8px; 
            min-width: 44px;
            min-height: 44px;
            touch-action: manipulation;
          }
          .header-right { width: 36px; }
          .page-title { font-size: clamp(20px, 7vw, 28px); margin-bottom: 4px; }
          .page-sub { font-size: 13px; }
        }

        @media (max-width: 360px) {
          .page-title { font-size: clamp(18px, 6vw, 24px); }
          .page-sub { font-size: 12px; }
        }

        @media (min-width: 768px) {
          .back-btn { padding: 10px 14px; border-radius: 12px; }
        }

        * { 
          -webkit-font-smoothing: antialiased; 
          -moz-osx-font-smoothing: grayscale;
          -webkit-tap-highlight-color: transparent;
        }

        button, a {
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
        }
      `})]})},Q=q;export{Q as default};
