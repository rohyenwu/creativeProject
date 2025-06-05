document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('csvUploadForm');
    const uploadButton = document.getElementById('uploadButton');
    const uploadStatusDiv = document.getElementById('uploadStatus');

    // 각 파일 업로드 섹션에 대한 정보를 객체로 관리
    const fileSections = {
        file1: {
            dropZoneId: 'dropZonePublic',
            fileInputId: 'csvFilePublic',
            fileInfoId: 'fileInfoPublic',
            file: null, // 선택된 파일 객체 저장
            btn: 'clearFileBtnPublic'
        },
        file2: {
            dropZoneId: 'dropZoneOuting',
            fileInputId: 'csvFileOuting',
            fileInfoId: 'fileInfoOuting',
            file: null,
            btn: 'clearFileBtnOuting'
        },
        file3: {
            dropZoneId: 'dropZoneLeisure',
            fileInputId: 'csvFileLeisure',
            fileInfoId: 'fileInfoLeisure',
            file: null,
            btn: 'clearFileBtnLeisure',
        },
        file4: {
            dropZoneId: 'dropZoneHospital',
            fileInputId: 'csvFileHospital',
            fileInfoId: 'fileInfoHospital',
            file: null,
            btn: 'clearFileBtnHospital'
        }
    };

    // 모든 드롭존과 파일 입력에 이벤트 리스너 설정
    Object.keys(fileSections).forEach(fileKey => {
        const section = fileSections[fileKey];
        const dropZone = document.getElementById(section.dropZoneId);
        const fileInput = document.getElementById(section.fileInputId);
        const fileInfoDiv = document.getElementById(section.fileInfoId);
        const clearBtn = document.getElementById(section.btn)

        if (!dropZone || !fileInput || !fileInfoDiv) {
            console.error(`Elements for ${fileKey} not found.`);
            return;
        }

        // 드롭존 클릭 시 파일 입력창 열기
        dropZone.addEventListener('click', () => fileInput.click());
        dropZone.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                fileInput.click();
            }
        });

        // 드래그 이벤트 처리
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('drag-over');
        });

        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('drag-over');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
            const files = e.dataTransfer.files;
            if (files.length > 0 && files[0].type === 'text/csv') {
                fileInput.files = files; // 드롭된 파일을 input의 files로 설정
                handleFileSelect(fileInput, fileKey);
            } else {
                alert('CSV 파일만 업로드할 수 있습니다.');
            }
        });

        // 파일 선택 시 처리
        fileInput.addEventListener('change', () => handleFileSelect(fileInput, fileKey));

        // X 버튼 클릭 시 파일 선택 취소 처리
        clearBtn.addEventListener('click', () => {
            fileInput.value = null; // 파일 입력 요소의 값 초기화 (중요!)
            fileSections[fileKey].file = null; // 내부 상태에서 파일 정보 제거

            // 파일 정보 UI 숨기기 및 텍스트 초기화
            fileInfoDiv.style.display = 'none';
            const fileNameSpan = fileInfoDiv.querySelector('.file-name');
            const fileSizeSpan = fileInfoDiv.querySelector('.file-size');
            if (fileNameSpan) fileNameSpan.textContent = '';
            if (fileSizeSpan) fileSizeSpan.textContent = '';

            console.log(`${fileKey} 파일 선택이 취소되었습니다.`);
        });

    });

    function handleFileSelect(inputElement, fileKey) {
        const file = inputElement.files[0];
        const section = fileSections[fileKey];
        const fileInfoDiv = document.getElementById(section.fileInfoId);
        const fileNameSpan = fileInfoDiv.querySelector('.file-name');
        const fileSizeSpan = fileInfoDiv.querySelector('.file-size');

        if (file) {
            if (file.type === 'text/csv') {
                section.file = file; // 파일 객체 저장
                fileNameSpan.textContent = file.name;
                fileSizeSpan.textContent = (file.size / 1024).toFixed(2) + ' KB';
                fileInfoDiv.style.display = 'block';
            } else {
                alert('CSV 파일만 선택해주세요.');
                inputElement.value = ''; // 잘못된 파일 타입이면 입력 초기화
                section.file = null;
                fileInfoDiv.style.display = 'none';
            }
        } else {
            section.file = null;
            fileInfoDiv.style.display = 'none';
        }
        updateUploadButtonState();
    }

    function updateUploadButtonState() {
        // 하나 이상의 파일이 선택되었는지 확인
        const hasAnyFile = Object.values(fileSections).some(section => section.file !== null);
        uploadButton.disabled = !hasAnyFile;
    }

    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        uploadButton.disabled = true;
        uploadStatusDiv.style.display = 'block';
        uploadStatusDiv.className = 'alert alert-info';
        uploadStatusDiv.textContent = '파일을 업로드 중입니다...';

        const formData = new FormData();
        let fileCount = 0;

        Object.keys(fileSections).forEach(fileKey => {
            if (fileSections[fileKey].file) {
                formData.append(fileKey, fileSections[fileKey].file, fileSections[fileKey].file.name);
                fileCount++;
            }
        });

        if (fileCount === 0) {
            uploadStatusDiv.className = 'alert alert-warning';
            uploadStatusDiv.textContent = '업로드할 파일이 없습니다.';
            uploadButton.disabled = false; // 다시 활성화 (혹은 true 유지)
            return;
        }

        try {
            const response = await fetch('/adminPage', { // FastAPI 엔드포인트
                method: 'POST',
                body: formData
                // headers: { 'Content-Type': 'multipart/form-data' } // FormData는 자동으로 설정됨
            });

            if (response.ok) {
                const result = await response.json(); // 또는 response.text() 등 응답 형식에 따라
                uploadStatusDiv.className = 'alert alert-success';
                uploadStatusDiv.textContent = '파일 업로드 성공!';
                console.log('Upload successful:', result);
                // 성공 후 폼 초기화 또는 다른 작업
                resetForm();
            } else {
                const errorData = await response.text(); // 에러 메시지를 텍스트로 받음
                uploadStatusDiv.className = 'alert alert-danger';
                uploadStatusDiv.textContent = `업로드 실패: ${response.status} ${response.statusText}. 서버 응답: ${errorData}`;
                console.error('Upload failed:', response.status, response.statusText, errorData);
            }
        } catch (error) {
            uploadStatusDiv.className = 'alert alert-danger';
            uploadStatusDiv.textContent = '업로드 중 오류 발생: ' + error.message;
            console.error('Error during upload:', error);
        } finally {
            // 파일이 하나라도 있었고, 업로드 시도가 있었으면 버튼은 다시 활성화 할지 결정.
            // 일단은 성공/실패와 관계없이 한번 시도했으면 그대로 두거나, resetForm에서 처리
            // updateUploadButtonState(); // 여기서 호출하면 선택된 파일이 그대로이므로 다시 활성화됨. 초기화 후 호출해야 함.
        }
    });

    function resetForm() {
        Object.keys(fileSections).forEach(fileKey => {
            const section = fileSections[fileKey];
            section.file = null;
            document.getElementById(section.fileInputId).value = ''; // 파일 입력 초기화
            const fileInfoDiv = document.getElementById(section.fileInfoId);
            fileInfoDiv.style.display = 'none';
            fileInfoDiv.querySelector('.file-name').textContent = '';
            fileInfoDiv.querySelector('.file-size').textContent = '';
        });
        uploadButton.disabled = true; // 업로드 버튼 비활성화
    }

    // 초기 업로드 버튼 상태 설정
    updateUploadButtonState();
});