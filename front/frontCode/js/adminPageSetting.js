document.addEventListener('DOMContentLoaded', function () {
    const dropZone = document.getElementById('dropZone');
    const csvFileInput = document.getElementById('csvFile');
    const uploadButton = document.getElementById('uploadButton');
    const fileInfoPreview = document.getElementById('fileInfoPreview');
    const fileNameSpan = document.getElementById('fileName');
    const fileSizeSpan = document.getElementById('fileSize');
    const csvUploadForm = document.getElementById('csvUploadForm');

    let selectedFile = null;

    function handleFile(file) {
        if (file && (file.type === 'text/csv' || file.name.toLowerCase().endsWith('.csv'))) {
            selectedFile = file;
            fileNameSpan.textContent = file.name;
            fileSizeSpan.textContent = (file.size / 1024).toFixed(2) + ' KB';
            fileInfoPreview.style.display = 'block';
            uploadButton.disabled = false;
            dropZone.setAttribute('aria-label', `선택된 파일: ${file.name}. 다른 파일을 선택하려면 클릭하거나 드래그 앤 드롭하세요.`);
        } else {
            selectedFile = null;
            fileInfoPreview.style.display = 'none';
            uploadButton.disabled = true;
            dropZone.setAttribute('aria-label', 'CSV 파일 드래그 앤 드롭 영역 또는 클릭하여 파일 선택');
            if (file) { // Only alert if a file was actually selected/dropped but was invalid
                alert('CSV 파일(.csv)만 업로드할 수 있습니다.');
            }
            csvFileInput.value = ''; // Reset file input
        }
    }

    // 드롭존 클릭 시 파일 입력 필드 트리거
    dropZone.addEventListener('click', () => csvFileInput.click());
    dropZone.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault(); // 기본 동작 방지 (스페이스바로 인한 스크롤 등)
            csvFileInput.click();
        }
    });


    // 드래그 이벤트
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove('drag-over');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    });

    // 파일 입력 변경 시
    csvFileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        } else {
            handleFile(null); // Handle case where file selection is cancelled
        }
    });

    // 업로드 버튼 클릭
    csvUploadForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (selectedFile) {
            alert(`'${selectedFile.name}' 파일 업로드를 시작합니다`);

            // 여기에 실제 파일 업로드 로직을 추가합니다.
            // 예: FormData와 fetch API 사용
            // const formData = new FormData();
            // formData.append('csv_file', selectedFile);
            //
            // fetch('/your-upload-endpoint', {
            //   method: 'POST',
            //   body: formData
            // })
            // .then(response => response.json())
            // .then(data => {
            //   console.log('Success:', data);
            //   alert('파일 업로드 성공!');
            //   // 폼 초기화
            //   handleFile(null);
            //   csvUploadForm.reset();
            // })
            // .catch(error => {
            //   console.error('Error:', error);
            //   alert('파일 업로드 실패.');
            // });

        } else {
            alert('업로드할 CSV 파일을 선택해주세요.');
        }
    });
});