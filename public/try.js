fetch("/admin/reports")
.then(res=res.json())
.then(data=>{

    const tablebody=document.getElementById("reportTableBody");

    data.forEach(report=>{

tablebody.innerHTML+=`
 <tr>
<td>R${report.ReportId}</td>
<td>${report.Name}${report.Surname}</td>
<td>${report.Gender}</td>
<td>${report.Category}</td>
<td>${report.Date}</td>


<select id="status-${report.ReportId}">
 <option value="Submitted" ${report.Status==="Submitted"} ? "selected" :"">Submitted</option>
 <option value="In progress" ${report.Status==="In Progress"}? "selected": "">In progress</option>
 <option value="Resolved" ${report.Status==="Resolved"? "selected":""}>Resolved</option>

</select>

<td>${report.Description}</td>
<td>button onclick="updateStatus(${report.reportID})">Update</td>
<td> button onclick="viewEvidence(${report.reportUD}")>View Evidence</td>

</tr>



`;



    });


});
