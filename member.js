function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);

    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}


function loadMemberInfo() {
    let memberId = getParameterByName('id');

    fetch(
        "https://sprata-team-project-default-rtdb.asia-southeast1.firebasedatabase.app/members.json"
    )
        .then((res) => res.json())
        .then((members) => {
            let member = members[memberId];

            // 멤버의 상세 정보를 HTML 요소로 만듭니다.
            let memberInfoHtml = `
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div style="display: flex; align-items: flex-start;">
                        <img src="${member.imageUrl}" alt="팀원 이미지" style="width: 200px; margin-right: 20px;" />
                        
                        <div>
                            <p>이름: ${member.name}</p>
                            <p>MBTI: ${member.mbti}</p>
                            <p>블로그 URL:${member.blogUrl}</p>
                        </div>
                    </div>

                    <!-- 수정 및 삭제 버튼 추가 -->
                    <div>
                        <!-- 'editMember' 함수 호출 및 모달 표시 -->
                        <button onclick='editMember("${memberId}")' data-toggle='modal' data-target='#editModal'>수정</button>

                        <!-- 'deleteMember' 함수 호출 -->
                        <button onclick='deleteMember("${memberId}")'>삭제</button>

                        <button onclick='goBack()'>돌아가기</button>
                    </div>

                </div>

                <!-- 한마디와 자기소개 섹션 추가 -->
                <div style="margin-top: 20px;">
                    <h2>한마디</h2>
                    <p>${member.once}</p>

                    <h2>자기소개</h2>
                    <p>${member.bio}</p>
                </div>`;
            
            // 'member-info' div에 멤버의 상세 정보를 추가합니다.
            document.getElementById('member-info').innerHTML = memberInfoHtml;
        });
}
function editMember(memberId) {
    // 현재 멤버의 정보를 가져옵니다.
    fetch(`https://sprata-team-project-default-rtdb.asia-southeast1.firebasedatabase.app/members/${memberId}.json`)
        .then((res) => res.json())
        .then((member) => {
            // 현재 멤버의 정보로 기본 값을 설정한 수정 form을 만듭니다.
            let editFormHtml = `
                <form id="edit-form">
                    <label for="name">이름:</label>
                    <input type="text" id="name" name="name" value="${member.name}"><br>
                    <label for="mbti">MBTI:</label>
                    <input type="text" id="mbti" name="mbti" value="${member.mbti}"><br>
                    <label for="blogUrl">블로그 URL:</label>
                    <input type="text" id="blogUrl" name ="blogUrl"value="${member.blogUrl}"><br> 
                    <label for="once">한마디 :</label>
                    <input type ="text" id="once" value="${member.once}"><br/> 
                    <label for="bio">자기소개 :</label><br/>
                    <textarea id= "bio">${member.bio}</textarea><br/>  
                </form>`;
            
            document.getElementById('edit-form-container').innerHTML = editFormHtml;
            
            // 'Submit' 버튼도 추가합니다.
            document.getElementById('edit-form-container').innerHTML += `
                <button onclick='updateMemberInfo("${memberId}")'>Submit</button>`;
        });
}

function updateMemberInfo(memberId) {
    let newName = document.getElementById('name').value;
    let newMbti = document.getElementById('mbti').value;
    let newBlogUrl = document.getElementById('blogUrl').value;
    
    // '한마디'와 '자기소개' 정보도 가져옵니다.
    let newOnce = document.getElementById('once').value;
    let newBio = document.getElementById('bio').value;

     fetch(`https://sprata-team-project-default-rtdb.asia-southeast1.firebasedatabase.app/members/${memberId}.json`, {
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
        $('#editModal').modal('hide');
     })
     .catch((error) => console.error('Error:', error));
}


function deleteMember(memberId) {
    // 삭제할 멤버의 이름을 입력받습니다.
    let inputName = prompt("정말로 삭제하시겠습니까?, 삭제하실거면 이름을 입력하세요:");

    // Firebase 데이터베이스에서 해당 멤버 정보를 가져옵니다.
    fetch(`https://sprata-team-project-default-rtdb.asia-southeast1.firebasedatabase.app/members/${memberId}.json`)
        .then((res) => res.json())
        .then((member) => {
            // 입력받은 이름이 실제 멤버의 이름과 일치하는지 확인합니다.
            if (inputName !== member.name) {
                alert("입력한 이름이 잘못되었습니다. 다시 시도해주세요.");
                return;
            }

            // Firebase 데이터베이스에서 기존 멤버 정보를 삭제합니다.
            return fetch(`https://sprata-team-project-default-rtdb.asia-southeast1.firebasedatabase.app/members/${memberId}.json`, {
                method: 'DELETE',
            });
        })
        .then((res) => res && res.json())
        .then((data) => {
            if (data === null) return;  // 만약 앞서서 프로세스가 중단되었다면 아무 것도 하지 않습니다.
            alert("삭제 성공");
            // 변경된 멤버 정보를 다시 불러옵니다.
            loadMemberInfo();
        })
        .catch((error) => console.error('Error:', error));
}
function goBack() {
    window.history.back();
}