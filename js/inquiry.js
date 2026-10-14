(function () {
    var form = document.getElementById('inquiry-form');
    if (!form) return;

    var adultsSelect = document.getElementById('adults');
    var childrenSelect = document.getElementById('children');
    var adultAges = document.getElementById('adult-ages');
    var childAges = document.getElementById('child-ages');
    var packageSelect = document.getElementById('package');
    var customFields = document.getElementById('custom-fields');
    var dateFrom = document.getElementById('date-from');
    var dateTo = document.getElementById('date-to');
    var success = document.getElementById('inquiry-success');

    var customInputs = customFields.querySelectorAll('textarea, input');

    function fillCount(select, min, max) {
        for (var n = min; n <= max; n++) {
            var option = document.createElement('option');
            option.value = String(n);
            option.textContent = String(n);
            select.appendChild(option);
        }
    }

    function ageOptions(min, max, includeUnderOne) {
        var html = '<option value="">Select age</option>';
        if (includeUnderOne) {
            html += '<option value="Under 1">Under 1</option>';
        }
        for (var age = min; age <= max; age++) {
            html += '<option value="' + age + '">' + age + '</option>';
        }
        return html;
    }

    function renderAges(container, count, prefix, legend, min, max, includeUnderOne) {
        var previous = {};
        container.querySelectorAll('select').forEach(function (select) {
            previous[select.name] = select.value;
        });
        container.innerHTML = '';
        if (!count) return;

        for (var i = 1; i <= count; i++) {
            var name = prefix + '-' + i;
            var field = document.createElement('div');
            field.className = 'form-field age-field';
            field.innerHTML =
                '<label for="' + name + '">' + legend + ' ' + i + '</label>' +
                '<select id="' + name + '" name="' + name + '" required>' +
                ageOptions(min, max, includeUnderOne) +
                '</select>';
            container.appendChild(field);
            var select = field.querySelector('select');
            if (previous[name]) select.value = previous[name];
        }
    }

    function syncCustomFields() {
        var custom = packageSelect.value === 'custom';
        customFields.hidden = !custom;
        customInputs.forEach(function (input) {
            input.required = custom;
            if (!custom) clearError(input);
        });
    }

    function clearError(field) {
        var wrap = field.closest('.form-field');
        if (!wrap) return;
        wrap.classList.remove('is-invalid');
        var message = wrap.querySelector('.field-error');
        if (message) message.remove();
        if (field.getAttribute('aria-invalid') === 'true') {
            field.removeAttribute('aria-invalid');
        }
    }

    function showError(field, message) {
        var wrap = field.closest('.form-field') || field;
        clearError(field);
        wrap.classList.add('is-invalid');
        field.setAttribute('aria-invalid', 'true');
        var note = document.createElement('p');
        note.className = 'field-error';
        note.textContent = message;
        wrap.appendChild(note);
    }

    function valueOf(id) {
        return document.getElementById(id).value.trim();
    }

    function validate() {
        var firstInvalid = null;

        function check(field, valid, message) {
            if (valid) {
                clearError(field);
                return;
            }
            showError(field, message);
            if (!firstInvalid) firstInvalid = field;
        }

        check(document.getElementById('name'), valueOf('name') !== '', 'Please enter your name.');
        var email = valueOf('email');
        check(document.getElementById('email'), /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), 'Please enter a valid email address.');
        check(document.getElementById('phone'), valueOf('phone') !== '', 'Please enter your phone number.');
        check(document.getElementById('nationality'), valueOf('nationality') !== '', 'Please enter your nationality.');
        check(adultsSelect, adultsSelect.value !== '', 'Please select the number of adults.');
        check(childrenSelect, childrenSelect.value !== '', 'Please select the number of children.');

        form.querySelectorAll('#adult-ages select, #child-ages select').forEach(function (select) {
            check(select, select.value !== '', 'Please select an age.');
        });

        check(dateFrom, dateFrom.value !== '', 'Please choose a start date.');
        check(dateTo, dateTo.value !== '', 'Please choose an end date.');
        if (dateFrom.value && dateTo.value) {
            check(dateTo, dateTo.value >= dateFrom.value, 'The end date must be on or after the start date.');
        }

        check(packageSelect, packageSelect.value !== '', 'Please select a package.');

        if (packageSelect.value === 'custom') {
            check(document.getElementById('custom-reason'), valueOf('custom-reason') !== '', 'Please tell us why you want a customized package.');
            check(document.getElementById('custom-location'), valueOf('custom-location') !== '', 'Please enter your preferred location.');
            check(document.getElementById('custom-budget'), valueOf('custom-budget') !== '', 'Please enter the per head budget.');
            check(document.getElementById('custom-activities'), valueOf('custom-activities') !== '', 'Please describe the preferred activities.');
        }

        var accommodation = form.querySelector('input[name="accommodation"]:checked');
        var accommodationField = document.getElementById('accommodation-field');
        if (accommodation) {
            accommodationField.classList.remove('is-invalid');
            var existing = accommodationField.querySelector('.field-error');
            if (existing) existing.remove();
        } else {
            accommodationField.classList.add('is-invalid');
            if (!accommodationField.querySelector('.field-error')) {
                var note = document.createElement('p');
                note.className = 'field-error';
                note.textContent = 'Please choose a type of accommodation.';
                accommodationField.appendChild(note);
            }
            if (!firstInvalid) firstInvalid = form.querySelector('input[name="accommodation"]');
        }

        if (firstInvalid) {
            firstInvalid.focus();
            return false;
        }
        return true;
    }

    function selectedText(select) {
        return select.options[select.selectedIndex].text;
    }

    function agesLine(container) {
        return Array.prototype.map.call(container.querySelectorAll('select'), function (select) {
            var label = container.querySelector('label[for="' + select.id + '"]');
            return (label ? label.textContent : select.name) + ': ' + select.value;
        }).join('\n');
    }

    function buildMessage() {
        var lines = [
            'Package inquiry',
            '',
            'Personal Information',
            'Name: ' + valueOf('name'),
            'Email: ' + valueOf('email'),
            'Phone: ' + valueOf('phone'),
            'Nationality: ' + valueOf('nationality'),
            'Adults: ' + adultsSelect.value,
            agesLine(adultAges) || null,
            'Children: ' + childrenSelect.value,
            agesLine(childAges) || null,
            'Preferred travel dates: ' + dateFrom.value + ' to ' + dateTo.value,
            '',
            'Travel Preferences',
            'Package: ' + selectedText(packageSelect)
        ];

        if (packageSelect.value === 'custom') {
            lines.push(
                'Reason for request for a customized package: ' + valueOf('custom-reason'),
                'Preferred location to travel: ' + valueOf('custom-location'),
                'Per head budget: ' + valueOf('custom-budget'),
                'Preferred activities: ' + valueOf('custom-activities')
            );
        }

        var accommodation = form.querySelector('input[name="accommodation"]:checked');
        lines.push(
            '',
            'Accommodation Preference',
            'Type of accommodation: ' + (accommodation ? accommodation.value : ''),
            '',
            'Special Requirements',
            'Medical conditions: ' + (valueOf('medical') || 'None stated'),
            'Special occasions: ' + (valueOf('occasions') || 'None stated'),
            'Allergies: ' + (valueOf('allergies') || 'None stated'),
            'Dietary restrictions: ' + (valueOf('dietary') || 'None stated')
        );

        return lines.filter(function (line) { return line != null; }).join('\n');
    }

    fillCount(adultsSelect, 1, 12);
    fillCount(childrenSelect, 0, 8);

    adultsSelect.addEventListener('change', function () {
        var count = Number(adultsSelect.value);
        renderAges(adultAges, count, 'adult-age', 'Age of adult', 18, 99, false);
        document.getElementById('adult-age-panel').hidden = !count;
    });
    childrenSelect.addEventListener('change', function () {
        var count = Number(childrenSelect.value);
        renderAges(childAges, count, 'child-age', 'Age of child', 1, 17, true);
        document.getElementById('child-age-panel').hidden = !count;
    });

    packageSelect.addEventListener('change', syncCustomFields);
    dateFrom.addEventListener('change', function () {
        dateTo.min = dateFrom.value;
    });

    var requested = new URLSearchParams(location.search).get('package');
    if (requested && packageSelect.querySelector('option[value="' + requested + '"]')) {
        packageSelect.value = requested;
    }
    syncCustomFields();

    form.addEventListener('input', function (event) {
        if (event.target && event.target.closest && event.target.closest('.is-invalid')) {
            clearError(event.target);
        }
    });

    form.addEventListener('submit', function (event) {
        event.preventDefault();
        if (!validate()) return;

        var subject = 'Package inquiry: ' + selectedText(packageSelect);
        var mailto = 'mailto:info@roamandrevel.lk?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(buildMessage());
        form.hidden = true;
        success.hidden = false;
        success.scrollIntoView({ behavior: 'smooth', block: 'center' });
        window.location.href = mailto;
    });
})();
