/*search mdn drag event on google */
const dropzone = document.querySelector(".drop-zone")
const browseBtn = document.querySelector(".browsebtn")
const fileInput = document.querySelector("#file-input")

// url required to upload file (given by gyan bhai)
// need this very important
const host = "https://www.googleapis.com/robot/v1/metadata/x509/myshare%40total-biplane-405517.iam.gserviceaccount.com";
// can convert below line into templete string but how to i don't know
const uploadURL = `${host}api/file`;
const emailURL = `${host}api/file/send`;

const progressContainer = document.querySelector(".progress-container")
const bgprogress = document.querySelector(".bg-progress");
const progressBar = document.querySelector(".bprogress-bar");
const percentDiv = document.querySelector("#percent");

const sharingContainer = document.querySelector(".sharing-container");
const fileURLInput = document.querySelector("#fileURL");
const copyBtn = document.querySelector("#copybtn");

const emailForm = document.querySelector("#email-form");
const toast = document.querySelector(".toast");

const maxAllowedSize = 100 * 1024 * 1024; //100mb

dropzone.addEventListener("dragover", (e)=>{
    // console.log("dragging");
    e.preventDefault();
    
    if(!dropzone.classList.contains("dragged")){
        dropzone.classList.add("dragged");
    }
});

dropzone.addEventListener("dragleave", ()=>{
    dropzone.classList.remove("dragged");
});

dropzone.addEventListener("drop", (e)=>{
    e.preventDefault();
    dropzone.classList.remove("dragged");
        // provide all detail of file on console
    // console.log(e); 
        // provide number of file drag in drop-zone
    // console.log(e.dataTransfer.files.length);
    const files = e.dataTransfer.files;
    console.log(files);
    if(files.length){
        fileInput.files = files;
        uploadfile();
    }
});

fileInput.addEventListener("change", ()=>{
    uploadfile();
});

browseBtn.addEventListener("click",()=>{
    fileInput.click();
});

copyBtn.addEventListener("click",()=>{
    fileURLInput.select();
    document.execCommand("copy");
    showToast("Link Copied");
});

const uploadfile = ()=>{
    if(fileInput.files.length > 1){
        fileInput.value="";
        showToast("Only upload one file");
        return;
    }

    const file = fileInput.files[0];

    if(file.size > maxAllowedSize){
        showToast("Cann't upload file more than 100MB");
        fileInput.value="";    // to reset upload container
        return;
    }

    progressContainer.style.display = "block";
    
    // const file = fileInput.files[0];
    const formData = new FormData();
    formData.append("myfile", file);
    // onli work if port is 3000
    const xhr = new XMLHttpRequest();

    xhr.onreadystatechange = ()=>{
        // console.log(xhr.readyState)
        if(xhr.readyState === XMLHttpRequest.DONE){
            console.log(xhr.response);
            onUploadSuccess(JSON.parse(xhr.response)); // to convert xhr url into js object  // NOt working
        }                        //parse
    };

    xhr.upload.onprogress = updateProgress;

    xhr.upload.onerror = ()=>{
        fileInput.value = "";
        showToast(`Error in upload", ${xhr.statusText}`)
    };

    xhr.open("POST", uploadURL);
    xhr.send(formData);
};

// to determine progress
const updateProgress = (e)=>{
    // console.log(e);
    const percent = Math.round((e.loaded/e.total) *100);
    // consolelog(percent);
    bgprogress.computedStyleMap.width = `${percent}%`;
    percentDiv.innerText = percent;
    progressBar.computedStyleMap.transform = `scaleX(${percent/100})`;
};

const onUploadSuccess = ({file : url})=>{
    console.log(url);
    fileInput.value="";
    emailForm[2].removeAttribute("disabled", "true");
    progressContainer.style.display="none";
    sharingContainer.style.display = "block";
    
    fileURLInput.value = url;
}

emailForm.addEventListener("Submit", (e)=>{
    e.preventDefault();
    console.log("Submit form");

    const url=fileURLInput.value;
    const formData={
        uuid: url.split("/").splice(-1,1)[0],
        emailTo: emailForm.elements["to-email"].value,
        emailFrom: emailForm.elements["from-email"].value,
    };

    emailForm[2].setAttribute("disabled", "true");
    console.log(formData);

    fetch(emailURL, {
        method: "POST",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify(formData)
    }).then((res) => res.json())
        // .then((data)) =>{
        //     console.log(data);
        // }
       .then((success) =>{
        console.log(success);
        if(success){
            sharingContainer.style.display='none';
            showToast("Email send");
        }
    });
});

let toastTimer;
const showToast = (msg) =>{
    toast.innerText=msg;
    toast.style.transform = "translateY(-50%,0)";
    clearTimeout(toastTimer);
    toastTimer= setTimeout(()=>{
        toast.style.transform = "translateY(-50%, 90px)";
    }, 2000);
};