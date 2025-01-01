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
                'X-CSRF-TOKEN': getToken()
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
                'Content-Type': 'text/plain',
                'X-CSRF-TOKEN': getToken()
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
        headers: {
            'Content-Type':'application/json',
            'X-CSRF-TOKEN': getToken()
        },
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

function deleteCustomer(id){
    let conf = confirm("Delete Permanently ?");
    let state = conf ? "delete" : "yes"
    if(prompt(`Are you sure you want to delete this customer?\nType '${state}' to confirm`) === state){

        fetch(`${API_BASE_URL}/${id}`,{
            method: 'DELETE',
            headers: {
                delete : `${state}`
            }
        }).then(res => res.text())
        .then(res => {
            alert(res.toString());
            loadAllTransactions(document.getElementById("sort-type").value)
            window.location.reload();
        })
        .catch(err => alert(err));
    }
}

function restoreCustomer(id){
    fetch(`${API_BASE_URL}/restore/${id}`)
    .then(res => res.text())
    .then(data =>{alert(data)})
    .catch(err =>{console.log(err)});

    loadAllTransactions(document.getElementById("sort-type").value)
    window.location.reload()

}