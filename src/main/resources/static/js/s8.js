function checkMobile(event){
    
    let body = document.getElementById('mobile').value || null;
    
    if(body == null)
        alert("please enter mobile number");
    
    else if(body.length != 10)
        alert(`mobile number should contain exact 10 digits not ${body.length} digits`)
    
    else{
        fetch(`${API_BASE_URL}/check/mobile`, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain',
            },
            body: body
        }).then(res => res.text()).then(res => alert(res.toString()))
        .catch(error => alert("error: " + error));
    }
}

function checkReferredBy(){
    
    let body = document.getElementById('referredBy').value || null;
    
    if(body == null)
        alert("please enter refrral id");
    
    else{

        fetch(`${API_BASE_URL}/check/referrer`, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain'
            },
            body: body
        }).then(res => res.text()).then(res => alert(res.toString()))
        .catch(error => alert("error: " + error));
    }
}

async function getName(id, field){
    let url = `${API_BASE_URL}/${field}/${id}/name`;
    await fetch(url)
    .then(res=>res.text())
    .then(res =>{
        console.log(res.toString());
        return res.toString();
    })
    .catch(e =>{
        console.log(e);
    });
}

// download receipt
async function getReceipt(transaction) {
    
    let body = JSON.stringify(transaction);
    fetch(`${API_BASE_URL}/receipt`,{
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: body
    }).then(res => res.blob())
    .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `receipt_${transaction.customerId}_${new Date().getTime().toString()}.pdf`;
        a.click();
    }).catch(err => alert(err));
}

document.getElementById("sort-type").addEventListener("change",(event)=>{
    loadAllTransactions(event.target.value);
});

document.getElementById("sort-order").addEventListener("change",(event)=>{
    SHORT_ORD = event.target.value;
    loadAllTransactions(document.getElementById("sort-type").value);
});

async function exportExcel() {
    fetch(`${API_BASE_URL}/excel`)
    .then(res => res.blob())
    .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `customer_data_${new Date().toLocaleString()}.xlsx`;
        a.click();
    }).catch(err => alert(err));
}