function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);

    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}


function loadMemberInfo() {
    let memberId = getParameterByName('id');

    fetch(
        "https://sparta9960-b0b8c-default-rtdb.asia-southeast1.firebasedatabase.app/members.json"
    )
        .then((res) => res.json())
        .then((members) => {
            let member = members[memberId];

            // 멤버의 상세 정보를 HTML 요소로 만듭니다.
            let memberInfoHtml = `
                <div class="member-info-container">
                <div class="member-details">
                    <img src="${member.imageUrl}" alt="팀원 이미지" class="member-image" />
                    
                    <div class="member-details-content">
                        <p id="username">이름 : ${member.name}</p>
                        <p>MBTI : ${member.mbti}</p>
                        <p>블로그 URL : ${member.blogUrl}</p>
                    </div>
                </div>

                <!-- 수정 및 삭제 버튼 추가 -->
                <div class="action-buttons">
                    <!-- 'editMember' 함수 호출 및 모달 표시 -->
                    <button onclick='editMember("${memberId}")' data-toggle='modal' data-target='#editModal'><i class="fas fa-edit"></i></button>

                    <!-- 'deleteMember' 함수 호출 -->
                    <button onclick='deleteMember("${memberId}")'><i class="fas fa-trash-alt"></i></button>

                    <button onclick='goBack()'><i class="fas fa-arrow-left"></i></button>
                </div>

                </div>

                <!-- 한마디와 자기소개 섹션 추가 -->
                <div class="section-container">
                    <h2 class="section-heading">한마디</h2>
                    <p class="section-content">${member.once}</p>

                    <h2 class="section-heading">자기소개</h2>
                    <p class="section-content">${member.bio}</p>
                </div>
                
                <div></div>`;
                
            const commentDiv = `
            <div class="container text-center">
             <div class="row comment-form">
               <div class="col-2">
                 <input
                   class="form-control comment-name-input"
                   type="text"
                   placeholder="이름"
                   id="comment-name"
                   aria-label="default input example"
                 />
               </div>
               <div class="col-8">
                 <textarea
                   class="form-control comment-content-input"
                   placeholder="내용을 입력해주세요!"
                   id="comment-content"
                 ></textarea>
               </div>
            
               <div class="col-2">
                 <button type="button" onclick="submitCommentByRest()" class="btn btn-primary comment-submit-button">
                   등록
                 </button>
               </div>
             </div>
            </div>
            
            <div class="container text-center comments"></div>
            
            <div
             class="modal fade"
             id="commentModal"
             tabindex="-1"
             aria-labelledby="commentModalLabel"
             aria-hidden="true"
            >
             <div class="modal-dialog modal-dialog-centered">
               <div class="modal-content">
                 <div class="modal-header">
                   <h1 class="modal-title fs-5" id="commentModalLabel">댓글 수정하기</h1>
                   <button
                     type="button"
                     class="btn-close"
                     data-bs-dismiss="modal"
                     aria-label="Close"
                   ></button>
                 </div>
                 <div class="modal-body">
                   <textarea
                     class="form-control comment-content-input"
                     id="comment-update-content"
                   ></textarea>
                 </div>
                 <div class="modal-footer">
                   <button
                     type="button"
                     class="btn btn-secondary"
                     onclick="clearClickedClass()"
                     data-bs-dismiss="modal"
                   >
                     취소
                   </button>
                   <button
                     type="button"
                     class="btn btn-primary"
                     data-bs-dismiss="modal"
                     onclick="updateComment()"
                   >
                     수정하기
                   </button>
                 </div>
               </div>
             </div>
            </div>`;
            // 'member-info' div에 멤버의 상세 정보를 추가합니다.
            document.getElementById('member-info').innerHTML = memberInfoHtml + commentDiv;
            fetchCommentsByRest();
        }
        );
}
function editMember(memberId) {
    // 현재 멤버의 정보를 가져옵니다.
    fetch(`https://sparta9960-b0b8c-default-rtdb.asia-southeast1.firebasedatabase.app/members/${memberId}.json`)
        .then((res) => res.json())
        .then((member) => {
            // 현재 멤버의 정보로 기본 값을 설정한 수정 form을 만듭니다.
            let editFormHtml = `
        <div id="inputBox">
            <div class="input-form-box"><span>이름 </span><input type="text" id="name" name="name"  value="${member.name}" class="form-control" disabled readonly></div>
            <div class="input-form-box"><span>MBTI </span><input type="text" id="mbti" name="blog"  value="${member.mbti}" class="form-control"></div>
            <div class="input-form-box"><span>블로그 </span><input type="text" id="blogUrl" name="blog" value="${member.blogUrl}" class="form-control"></div>
            <div class="input-form-box"><span>한마디 </span><input type="text" id="once" name="once" value="${member.once}" class="form-control"></div>
            <div class="mb-3">
            <label for="bio" class="form-label">자기소개</label>
            <textarea class="form-control" id="bio" rows="3">${member.bio}</textarea>
        </div>`;
            
            document.getElementById('edit-form-container').innerHTML = editFormHtml;
            
            // 'Submit' 버튼도 추가합니다.
            document.getElementById('edit-form-container').innerHTML += `
            <div class="button-input-box" >
            <button type="button" onclick='updateMemberInfo("${memberId}")' class="btn btn-primary btn-xs" style="width:100%">확인</button>
          </div>`;
        });
}

function updateMemberInfo(memberId) {
    let newName = document.getElementById('name').value;
    let newMbti = document.getElementById('mbti').value;
    let newBlogUrl = document.getElementById('blogUrl').value;
    
    // '한마디'와 '자기소개' 정보도 가져옵니다.
    let newOnce = document.getElementById('once').value;
    let newBio = document.getElementById('bio').value;
    var modal = new bootstrap.Modal(document.getElementById('editModal'));
     fetch(`https://sparta9960-b0b8c-default-rtdb.asia-southeast1.firebasedatabase.app/members/${memberId}.json`, {
         method: 'PATCH',
         body: JSON.stringify({
             name: newName,
             mbti: newMbti,
             blogUrl: newBlogUrl,
             once: newOnce,  // 추가
             bio: newBio  // 추가
         }),
         headers: { 'Content-Type': 'application/json' },
     })
     .then((res) => res && res.json())
     .then((data) => {
         if (data === null) return;  // 만약 앞서서 프로세스가 중단되었다면 아무 것도 하지 않습니다.

         console.log(`멤버 ID ${memberId}의 정보가 변경되었습니다.`);
         
         // 변경된 멤버 정보를 다시 불러옵니다.
         loadMemberInfo();

        // "수정이 완료되었습니다"라는 알림창을 띄웁니다.
        alert("수정이 완료되었습니다.");

        // 모달 창을 닫습니다.
        var editModal = document.getElementById('editModal')
        var modal = bootstrap.Modal.getInstance(editModal);
        
        if (modal) {
            modal.hide();
        }
     })
     .catch((error) => console.error('Error:', error));
}


function deleteMember(memberId) {
    // 삭제할 멤버의 이름을 입력받습니다.
    let inputName = prompt("정말로 삭제하시겠습니까?, 삭제하실거면 이름을 입력하세요:");
    if (inputName === null || inputName === "") {
        return;  
    }
    // Firebase 데이터베이스에서 해당 멤버 정보를 가져옵니다.
    fetch(`https://sparta9960-b0b8c-default-rtdb.asia-southeast1.firebasedatabase.app/members/${memberId}.json`)
        .then((res) => res.json())
        .then((member) => {
            // 입력받은 이름이 실제 멤버의 이름과 일치하는지 확인합니다.
            if (inputName !== member.name) {
                alert("입력한 이름이 잘못되었습니다. 다시 시도해주세요.");
                return Promise.reject(); 
            }

            // Firebase 데이터베이스에서 기존 멤버 정보를 삭제합니다.
            return fetch(`https://sparta9960-b0b8c-default-rtdb.asia-southeast1.firebasedatabase.app/members/${memberId}.json`, {
                method: 'DELETE',
            });
        })
        .then((res) => res && res.json())
        .then((data) => {
            if (data === null)  
            alert("삭제 성공");
            // 변경된 멤버 정보를 다시 불러옵니다.
            loadMemberInfo();
            window.location.href = 'codingcookings.html';
        })
        .catch((error) => console.error('Error:', error));
}
function goBack() {
    window.history.back();
}