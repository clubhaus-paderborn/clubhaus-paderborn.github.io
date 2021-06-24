(async function () {

    // const apiUrl = 'http://localhost:3000/api/reservations';

    const apiUrl = 'https://clubhaus-paderborn.herokuapp.com/api/reservations';

    async function createObject(startDate, email, name, phone, address, dsgvo, dj, catering, guests, furtherInfo) {
        const reservation = {
            start_date: startDate,
            end_date: startDate,
            customer_email: email,
            customer_name: name,
            customer_phone: phone,
            customer_address: address,
            dsgvo_accepted: dsgvo === 'true',
            dj: dj,
            guests: guests,
            further_info: furtherInfo
        };

        return jQuery.post(apiUrl, {reservation}, null, 'json');
    }

    async function retrieveOccupiedDates() {
        return jQuery.getJSON(apiUrl)
            .then(results => results.map(res => [new Date(res.start_date), new Date(res.end_date)]));
    }

    let startDate = null;
    let picker = null;


    function initializePicker(disabledDays) {
        if (picker != null) {
            picker.destroy();
        }
        picker = new Litepicker({
            element: document.getElementById('litepicker'),
            plugins: ['mobilefriendly'],
            lang: 'de-DE',
            inlineMode: true,
            lockDaysInclusivity: '[]',
            lockDays: disabledDays,
            minDate: new Date(new Date().toDateString()).setDate(new Date().getDate() + 4),
            highlightedDays: disabledDays,
            numberOfMonths: 1,
            showWeekNumbers: true,
            showTooltip: true,
            singleMode: true,
            tooltipText: {'one': 'Tag', 'other': 'Tage'},
            disallowLockDaysInRange: true,
            splitView: false,
            numberOfColumns: 1,
            format: 'DD.MM.YYYY',
            position: 'top',
            setup: (p) => {
                p.on('error:date', () => {
                    p.clearSelection();
                    startDate = null;
                    alert('Der gewählte Zeitraum kann nicht gewählt werden, da der Tag bereits belegt ist.');
                });
                p.on('selected', (date1) => {
                    startDate = date1.dateInstance;
                });
            }
        });
    }


    if (document.getElementById('litepicker') != null) {
        console.log('litepicker not null');
        initializePicker(await retrieveOccupiedDates());

        document.querySelector('#booking-form').addEventListener('submit', function (evt) {
            evt.preventDefault();
            const formData = new FormData(document.querySelector('#booking-form'));
            const formObj = {};
            for (let pair of formData.entries()) {
                formObj[pair[0]] = pair[1];
            }

            $('#booking-form :input').prop('disabled', true);

            const address = '' + formObj['street'] + ', ' + formObj['zip'] + ' ' + formObj['city'];
            createObject(startDate, formObj['email'], formObj['name'], formObj['telephone'], address, formObj['dsgvo'], formObj['dj'], formObj['catering'], formObj['guests'], formObj['further-info']).then(() => {
                alert('Die Anfrage wurde erfolgreich abgesendet! Eine Kopie wurde per Mail zugesandt' +
                    ' und wir melden uns bei dir um letzte Details zu klären.');
                $('#form-success').show();
            }).catch(async () => {
                $('#form-error').show();
                alert('Die Anfrage hat leider nicht geklappt. Bitte versuche es noch einmal.');
                initializePicker(await retrieveOccupiedDates());
                $('#booking-form :input').prop('disabled', false);
            });
        });
    }
})();
