function selectDegree(degree) {
    const degreeOptions = document.querySelectorAll('.degree-option');
    degreeOptions.forEach(option => {
        option.classList.remove('selected');
    });
    document.querySelector(`.degree-option[onclick="selectDegree('${degree}')"]`).classList.add('selected');
    document.getElementById('selectedDegree').value = degree;
}

function filterCourses() {
    const searchTerm = document.getElementById('courseSearch').value.toLowerCase();
    const courses = document.querySelectorAll('.course');
    courses.forEach(course => {
        if (course.textContent.toLowerCase().includes(searchTerm)) {
            course.style.display = 'block';
        } else {
            course.style.display = 'none';
        }
    });
}

function showCoursesList() {
    const coursesList = document.querySelector('.courses-list');
    coursesList.classList.add('show');
}

function selectCourse(courseName) {
    const courseSearch = document.getElementById('courseSearch');
    courseSearch.value = courseName;
    const coursesList = document.querySelector('.courses-list');
    coursesList.classList.remove('show');
}

const proceedButton = document.getElementById('proceedButton');
const agreeCheckbox = document.getElementById('agree');

agreeCheckbox.addEventListener('change', () => {
    if (agreeCheckbox.checked) {
        proceedButton.classList.add('active');
        proceedButton.removeAttribute('disabled');
    } else {
        proceedButton.classList.remove('active');
        proceedButton.setAttribute('disabled', 'true');
    }
});
