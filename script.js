const meetingsRef = firebase.database().ref('meetings');
let editingIndex = null;

document.getElementById('meetingForm').addEventListener('submit', function (event) {
    event.preventDefault();
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;
    const description = document.getElementById('description').value;
    const fileInput = document.getElementById('file');

    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const storageRef = firebase.storage().ref('documents/' + file.name);
        storageRef.put(file).then(() => {
            storageRef.getDownloadURL().then(url => {
                const meetingData = { date, time, description, fileURL: url };
                if (editingIndex !== null) {
                    meetingsRef.child(editingIndex).set(meetingData);
                    editingIndex = null;
                } else {
                    meetingsRef.push(meetingData);
                }
                renderMeetings();
                document.getElementById('meetingForm').reset();
            });
        });
    }
});

function renderMeetings() {
    meetingsRef.on('value', snapshot => {
        const tableBody = document.getElementById('meetingsTable').querySelector('tbody');
        tableBody.innerHTML = '';
        snapshot.forEach((childSnapshot) => {
            const meeting = childSnapshot.val();
            const row = document.createElement('tr');
            const key = childSnapshot.key;
            row.innerHTML = `
                <td>${meeting.date}</td>
                <td>${meeting.time}</td>
                <td>${meeting.description}</td>
                <td><a href="${meeting.fileURL}" target="_blank">Ver Documento</a></td>
                <td>
                    <button onclick="editMeeting('${key}')">Editar</button>
                    <button onclick="deleteMeeting('${key}')">Eliminar</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    });
}

function editMeeting(key) {
    meetingsRef.child(key).once('value').then(snapshot => {
        const meeting = snapshot.val();
        document.getElementById('date').value = meeting.date;
        document.getElementById('time').value = meeting.time;
        document.getElementById('description').value = meeting.description;
        editingIndex = key;
    });
}

function deleteMeeting(key) {
    meetingsRef.child(key).remove();
}

// Renderizar reuniones al cargar la página
renderMeetings();
