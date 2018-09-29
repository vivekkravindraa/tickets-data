var { key } = require('./access_key');

var baseUrl = `http://dct-api-data.herokuapp.com`;

var countHandle = document.getElementById('count');
var tableBodyHandle = document.getElementById('tableBody');
var ticketFormHandle = document.getElementById('ticketForm'); 

var nameHandle = document.getElementById('name');
var departmentHandle = document.getElementById('department');
// var priorityHandle = document.getElementById('priority');    // can't be done on multiple radio buttons
var priorityNames = document.getElementsByName('priority');     // radio buttons need to be accessed with names
var messageHandle = document.getElementById('message');

var nameErrorHandle = document.getElementById('nameError');
var departmentErrorHandle = document.getElementById('departmentError');
var priorityErrorHandle = document.getElementById('priorityError');
var messageErrorHandle = document.getElementById('messageError');

var alertHandle = document.getElementById('alert');

var selectHandle = document.getElementById('select');

var allBtnHandle = document.getElementById('allBtn');
var highBtnHandle = document.getElementById('highBtn');
var mediumBtnHandle = document.getElementById('mediumBtn');
var lowBtnHandle = document.getElementById('lowBtn');

var searchHandle = document.getElementById('search');

var progressHandle = document.getElementById('progress');

var tickets;
var progressCount = 0;
var percentage;

function filterTickets(priority) {
    tableBodyHandle.innerHTML = '';
    var count = 0;
    tickets.forEach(function(ticket) {
        if(ticket.priority === priority) {
            count++;
            buildRow(ticket);
        }  
    })
    countHandle.innerHTML = count;
}

selectHandle.addEventListener('change',function() {
    if(selectHandle.value === 'High') {
        filterTickets('High');   
    } else if(selectHandle.value === 'Medium') {
        filterTickets('Medium');
    } else if(selectHandle.value === 'Low') {
        filterTickets('Low');
    } else if(selectHandle.value === 'All') {
        tableBodyHandle.innerHTML = '';
        getTickets();
    }
}, false);

highBtnHandle.addEventListener('click',function() {
    filterTickets('High');
},false);

mediumBtnHandle.addEventListener('click',function(){
    filterTickets('Medium');
},false);

lowBtnHandle.addEventListener('click',function(){
    filterTickets('Low');
},false);

allBtnHandle.addEventListener('click',function() {
    tableBodyHandle.innerHTML = '';
    tickets.forEach(function(ticket) {
        buildRow(ticket);
    })
    countHandle.innerHTML = tickets.length;
},false);

// searchHandle.addEventListener('keyup',function() {
//     tableBodyHandle.innerHTML = '';
//     var searchResults = tickets.filter(function(ticket) {
//         return ticket.ticket_code.toLowerCase().indexOf(searchHandle.value.toLowerCase()) >= 0;
//         // return ticket_code -> toLowerCase() -> indexOf( user typed toLowerCase() ) > = 0
//     })
//     // console.log(searchResults);
//     searchResults.forEach(function(ticket) {
//         buildRow(ticket);
//     })
//     countHandle.innerHTML = searchResults.length;
// },false);

searchHandle.addEventListener('keyup',function() {
    tableBodyHandle.innerHTML = '';
    var searchResults = tickets.filter(function(ticket) {
        return ticket.ticket_code.toLowerCase().indexOf(searchHandle.value.toLowerCase()) >= 0 ||
        ticket.name.toLowerCase().indexOf(searchHandle.value.toLowerCase()) >= 0 ||
        ticket.department.toLowerCase().indexOf(searchHandle.value.toLowerCase()) >= 0 ||
        ticket.priority.toLowerCase().indexOf(searchHandle.value.toLowerCase()) >= 0 ||
        ticket.message.toLowerCase().indexOf(searchHandle.value.toLowerCase()) >= 0 ||
        ticket.status.toLowerCase().indexOf(searchHandle.value.toLowerCase()) >= 0;
    })
    // console.log(searchResults);
    searchResults.forEach(function(ticket) {
        buildRow(ticket);
    })
    countHandle.innerHTML = searchResults.length;
},false);

function clickMe(event) {
    var id = event.id;
    if(event.checked) {
        axios.put(`${baseUrl}/tickets/${id}?api_key=${key}`,{'status':'completed'})
        .then(function(response) {
            console.log(response.data);
        })
        progressCount++;
        percentage = progressCount/tickets.length * 100;
        progressHandle.setAttribute('style',`width:${percentage}%`);
        console.log(progressCount);
    } else {
        axios.put(`${baseUrl}/tickets/${id}?api_key=${key}`,{'status':'open'})
        .then(function(response) {
            console.log(response.data);
        })
        progressCount--;
        percentage = progressCount/tickets.length * 100;
        progressHandle.setAttribute('style',`width:${percentage}%`);
        console.log(progressCount);
    }
}

function buildRow(ticket){
    var tr = document.createElement('tr'); 
    tr.innerHTML = `
        <td>${ticket.ticket_code}</td>
        <td>${ticket.name}</td>
        <td>${ticket.department}</td>
        <td>${ticket.priority}</td>
        <td>${ticket.message}</td>     
        <td><input type="checkbox" id="${ticket.ticket_code}" onclick="clickMe(this)"></td>`;
    tableBodyHandle.appendChild(tr);
}

function getTickets() {
    axios.get(`${baseUrl}/tickets?api_key=${key}`)
    .then(function(response){
        tickets = response.data;
        countHandle.innerHTML = tickets.length; 
        tickets.forEach(function(ticket){
            buildRow(ticket);
        })
    })
    .catch(function(error){
        console.log(error);
    })
}

var hasErrors = {  
    name: true,
    department: true,
    priority: true,
    message: true
}

function validateName() {
    if(nameHandle.value === '') {
        nameErrorHandle.innerHTML = 'Name can not be blank';
        hasErrors.name = true;
    } else {
        nameErrorHandle.innerHTML = '';
        hasErrors.name = false;
    }
}

function validateDepartment() {
    if(departmentHandle.value === '') {
        departmentErrorHandle.innerHTML = 'Select an option in department';
        hasErrors.department = true;
    } else {
        departmentErrorHandle.innerHTML = '';
        hasErrors.department = false;       
    }
}

function validatePriority() {
    for(var i = 0; i < priorityNames.length; i++) {
        if(priorityNames[i].value === '') {
            priorityErrorHandle.innerHTML = 'Select the priority state';
            hasErrors.priority = true;
        } else {
            priorityErrorHandle.innerHTML = '';
            hasErrors.priority = false;  
        }
    }
}

function validateMessage() {
    if(messageHandle.value === '') {
        messageErrorHandle.innerHTML = 'You must enter a message';
        hasErrors.message = true;
    } else {
        messageErrorHandle.innerHTML = '';
        hasErrors.message = false;
    }
}

function getPriorityValue() {
    for(var i = 0; i < priorityNames.length; i++) {
        if(priorityNames[i].checked) {
            return priorityNames[i].value; 
        }
    }
}

function successAlert() {
    setTimeout(function() {
        alertHandle.style.visibility='visible';
    }, 1000);
}

ticketFormHandle.addEventListener('submit', function(e) {

    validateName();
    validateDepartment();
    validatePriority();
    validateMessage();

    if(Object.values(hasErrors).includes(true)) {
        e.preventDefault();  
    }
    
    var formData = {
        name: nameHandle.value,
        department: departmentHandle.value,
        priority: getPriorityValue(),
        message: messageHandle.value 
    }

    axios.post(`${baseUrl}/tickets?api_key=${key}`,formData)
    .then(function(response) {
        successAlert();
        var ticket = response.data;
        buildRow(ticket);   // Don't call the function, so that the undefined rows will stop appending to table
        countHandle.innerHTML = parseInt(countHandle.innerHTML) + 1;
        ticketFormHandle.reset(); 
    })
    .catch(function(error){
        console.log(error); 
    })

    // console.log(formData);

}, false);

var ticket_code = '';

axios.delete(`${baseUrl}/tickets/${ticket_code}?api_key=${key}`)
.then(function(response) {
    console.log(response.data);
    console.log(`Data with ticket code ${ticket_code} has been deleted`);
})
.catch(function(error) {
    console.log(error);
})

window.addEventListener('load',function(){
    // console.log('page has been loaded);
    getTickets();
},false);