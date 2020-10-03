const reportCards = document.querySelectorAll('.report-card')
const reportStart = 06; // july
const reportEnd = new Date().getMonth(); // current month
const months = ['January', 'Febuary', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

const yellowFill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: {
        argb: 'FFFFFF00'
    },

};
const redFill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: {
        argb: 'FFFF0000'
    },
};

const font = {
    name: 'Arial',
    bold: true
}
const CELL_WIDTH = 13.82;
const CELL_HEIGHT = 15.5;

const init = (office, officeId) => {

    reportCards.forEach(card => {
        const btn = card.querySelector('.download-report-btn')
        const select = document.querySelector('.mdc-select');
        for (let i = reportStart; i <= reportEnd; i++) {
            select.querySelector('.mdc-list').appendChild(monthList(i))
        }
        const monthSelect = new mdc.select.MDCSelect(select)
        monthSelect.value = new Date().getMonth().toString()
        btn.addEventListener('click', (ev) => {
            btn.classList.add('in-progress');

            http('GET', `${appKeys.getBaseUrl()}/api/office/${officeId}/attendance/?name=MTD&month=${monthSelect.value}&year=2020`).then(response => {
                console.log(response)
                response['30th Sep 2020'].pop()
                const employees = {}
                const dates = Object.keys(response);
                if (!dates.length) {
                    btn.classList.remove('in-progress');
                    document.getElementById('report-error').textContent = 'No check-ins found'
                    return
                }
                document.getElementById('report-error').textContent = ''
                const workbook = new ExcelJS.Workbook();
                workbook.creator = 'Growthfile Analytics Pvt Ltd.';
                workbook.created = new Date();
                const sheet = workbook.addWorksheet('Attendance Report', {
                    views: [{
                        showGridLines: true
                    }]
                });

                /** set cell properties like width,height & font */
                sheet.properties.defaultColWidth = CELL_WIDTH
                sheet.properties.defaultRowHeight = CELL_HEIGHT

                sheet.mergeCells('A1:B1');
                sheet.getCell('A1').value = 'ATTENDANCE ' + moment(monthSelect.value).format('MM') + ' 2020'
                sheet.getCell('A1').alignment = {
                    horizontal: 'center'
                }

                /** start cell filling operation */
                let startRowIndex = 3;
                let endRowIndex = 5;

                const subHeaders = []
                dates.forEach((date, index) => {

                    response[date].forEach(employeeData => {

                        if (employeeData.startTime && employeeData.endTime) {
                            employeeData.totalHours = moment.duration(moment(employeeData.endTime, 'HH:mm').diff(moment(employeeData.startTime, 'HH:mm'))).asHours();
                        }
                        if (employees[employeeData.phoneNumber]) {
                            employees[employeeData.phoneNumber].dates.push(Object.assign(employeeData, {
                                date
                            }))
                            if (employeeData.startTime || employeeData.endTime) {
                                employees[employeeData.phoneNumber].totalDaysWorked++
                                employees[employeeData.phoneNumber].totalHoursWorked += employeeData.totalHours
                            }
                        } else {
                            employees[employeeData.phoneNumber] = {
                                employeeName: employeeData['employeeName'],
                                totalDays: dates.length,
                                totalDaysWorked: 0,
                                totalHoursWorked: 0,
                                dates: [Object.assign(employeeData, {
                                    date
                                })]
                            }
                            if (employeeData.startTime || employeeData.endTime) {
                                employees[employeeData.phoneNumber].totalDaysWorked = 1
                                employees[employeeData.phoneNumber].totalHoursWorked = employeeData.totalHours

                            }
                        }
                    })

                    try {
                        sheet.mergeCells(1, startRowIndex, 1, endRowIndex)
                        sheet.getRow(1).getCell(startRowIndex).value = date
                        subHeaders.push('start time', 'end time', 'hours')
                        startRowIndex = endRowIndex + 1
                        endRowIndex += 3

                    } catch (e) {
                        console.log(e)
                    }
                })
                subHeaders.push('TOTAL DAYS', 'DAYS WORKED', 'TOTAL HOURS WORKED')
                const newHead = sheet.addRow([...['EMP NAME', 'MOBILE NO'], ...subHeaders])
                console.log(subHeaders)
                newHead.alignment = {
                    horizontal: 'center'
                }

                console.log(newHead)
                console.log(employees)

                Object.keys(employees).forEach(phoneNumber => {
                    const dateRangeArr = []
                    const item = employees[phoneNumber]
                    item.dates.forEach(date => {
                        dateRangeArr.push(date.startTime, date.endTime, date.totalHours)
                    })
                    dateRangeArr.push(item.totalDays, item.totalDaysWorked, item.totalHoursWorked)
                    // console.log(dateRangeArr)
                    const newRow = sheet.addRow([...[item.employeeName, phoneNumber], ...dateRangeArr])

                    newRow.alignment = {
                        horizontal: 'center'
                    }

                    // start with first date  cell and find hour value
                    // if hours are not found mark date as absent
                    // if hours are less than 8 mark date as invalid (user didn't completed 8 hours)
                    console.log(newRow)
                    console.log(dateRangeArr)
                    for (i = 5; i < newRow.cellCount; i += 3) {
                        const hourCell = newRow.getCell(i);
                        const endTimeCell = newRow.getCell(i - 1);
                        const startTimeCell = newRow.getCell(i - 2);
                        console.log(i)
                        if (newRow.getCell(i).value == null || newRow.getCell(i).value == undefined) {
                            sheet.mergeCells(newRow.getCell(i - 2).address, newRow.getCell(i).address)
                            hourCell.fill = redFill
                            endTimeCell.fill = redFill
                            startTimeCell.fill = redFill
                            startTimeCell.value = 'ABSENT'
                        } else if (newRow.getCell(i).value < 8) {
                            hourCell.fill = yellowFill
                            endTimeCell.fill = yellowFill
                            startTimeCell.fill = yellowFill
                        }
                    }
                })

                sheet.getColumn(1).width = CELL_WIDTH
                sheet.getColumn(2).width = CELL_HEIGHT

                sheet.getRow(1).font = font
                sheet.getRow(1).alignment = {
                    horizontal: 'center'
                }

                sheet.getColumn(1).font = font
                sheet.getRow(2).font = font
                sheet.getColumn(2).font = font


                /** Download workbook */
                workbook.xlsx.writeBuffer().then(data => {
                    var blob = new Blob([data], {
                        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    });
                    const url = window.URL.createObjectURL(blob);

                    const anchor = document.createElement('a');
                    anchor.href = url;
                    anchor.download = 'download.xlsx';
                    anchor.click();
                    window.URL.revokeObjectURL(url);
                    btn.classList.remove('in-progress');
                })
            })
        })
    })
}


const monthList = (month) => {
    const el = createElement('li', {
        className: 'mdc-list-item',

    })
    el.dataset.value = month
    el.innerHTML = `<span class = "mdc-list-item__ripple"></span> 
         <span class = "mdc-list-item__text">${months[month]}</span>`
    return el;
}