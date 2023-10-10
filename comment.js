import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import {
  getDatabase,
  ref,
  update,
  set,
  push,
  get,
  remove,
  query,
  orderByChild,
  equalTo,
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-database.js";

// firebase db 설정
const firebaseConfig = {
  apiKey: "AIzaSyAm6Ag7d4OkES-k8QRQVhtqj9p9dOUHo7I",
  authDomain: "sparta-33d77.firebaseapp.com",
  projectId: "sparta-33d77",
  storageBucket: "sparta-33d77.appspot.com",
  messagingSenderId: "29684425915",
  appId: "1:29684425915:web:d1fe87fa1101d7f973f59e",
  databaseURL:
    "https://sparta-33d77-default-rtdb.asia-southeast1.firebasedatabase.app",
};
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// DB에서 가장 최근에 등록된 댓글 가져와서 페이지에 댓글 추가하기
async function fetchLastComment() {
  const username = $("#username").val() || "테스트유저";
  const q = query(
    ref(db, "comments"),
    orderByChild("username"),
    equalTo(username)
  );

  try {
    const snapshot = await get(q);
    if (snapshot.exists()) {
      const comments = JSON.parse(JSON.stringify(snapshot.val()));
      // 댓글 늦게 단 순으로 정렬
      const commentEntries = Object.entries(comments);
      commentEntries.sort((a, b) => a.createdAt - b.createdAt);
      // 댓글 하나만 생성
      const [key, value] = commentEntries[commentEntries.length - 1];
      console.log(key, value);
      createCommentDiv(key, value);
    } else {
      console.log("읽은 데이터 없음");
    }
  } catch (error) {
    console.error("fetch comment error: " + error);
  }
}

// DB에서 댓글 전부 가져오고 페이지에도 등록함
async function fetchComments() {
  const username = $("#username").val() || "테스트유저";
  const q = query(
    ref(db, "comments"),
    orderByChild("username"),
    equalTo(username)
  );

  try {
    const snapshot = await get(q);
    console.log(snapshot);
    if (snapshot.exists()) {
      const comments = JSON.parse(JSON.stringify(snapshot.val()));
      console.log(comments);
      const commentEntries = Object.entries(comments);
      // 댓글 빨리 단 순으로 정렬
      commentEntries.sort((a, b) => a.createdAt - b.createdAt);

      // 댓글 모두 생성
      commentEntries.forEach(([key, value]) => {
        createCommentDiv(key, value);
      });
    } else {
      console.log("읽은 데이터 없음");
    }
  } catch (error) {
    console.error("fetch comment error: " + error);
  }
}

// DB에 댓글 등록하고 페이지에도 등록함
async function submitComment() {
  const commentAuthor = $("#comment-name").val();
  const content = $("#comment-content").val();
  const username = $("#username").val() || "테스트유저";
  const createdAt = new Date().toLocaleString();

  const data = {
    username: username,
    commentAuthor: commentAuthor,
    content: content,
    createdAt: createdAt,
  };
  const commentRef = ref(db, "comments");
  const newCommentRef = push(commentRef);
  try {
    await set(newCommentRef, data);

    console.log("comment added");
    clearCommentForm();
    await fetchLastComment();
  } catch (error) {
    console.error("comment add error" + error);
  }
}

// DB에서 댓글 수정하고 댓글 리스트에서도 수정
async function updateComment() {
  const commentKey = $(".click-update").data("functionArg");
  const commentRef = ref(db, "comments/" + commentKey);
  const newComment = {
    content: $("#comment-update-content").val(),
  };
  try {
    await update(commentRef, newComment);
    console.log("update comment!");
    console.log($(".click-update").find("p.fs-5"));
    $(".click-update").find("p.fs-5").text(newComment.content);

    clearClickedClass();
  } catch (error) {
    console.error("update comment " + error);
  }
}

// 수정하기 버튼 누르면 댓글 식별값 표시하고 수정 폼에 현재 댓글 내용 입력
function updateButtonClicked(commentKey) {
  $(`[data-function-arg="${commentKey}"]`).addClass("click-update");
  const comment = $(`[data-function-arg="${commentKey}"]`)
    .find("p.fs-5")
    .text();
  $("#comment-update-content").val(comment);
  $("#exampleModal").on("hidden.bs.modal", function (e) {
    clearClickedClass();
  });
}

// 수정 모달에서 취소 식별값 삭제
function clearClickedClass() {
  $(".click-update").removeClass("click-update");
}

// DB에서 댓글 삭제하고 댓글 리스트에서도 삭제
async function deleteComment(commentKey) {
  const commentRef = ref(db, "comments/" + commentKey);
  try {
    await remove(commentRef);
    console.log("delete comment!");
    clearComment(commentKey);
  } catch (error) {
    console.error("delete comment " + error);
  }
}

// 페이지에 댓글 하나 추가하기
function createCommentDiv(key, comment) {
  const commentDivTemplate = `<div class="comment-wrapper" data-function-arg="${key}"><div class="row justify-content-between">
  <div class="col-2"><p class="text-start fs-4">${comment.commentAuthor}</p></div>
  <div class="col-2">
    <p class="text-end">
      <button type="button" data-bs-toggle="modal" data-bs-target="#exampleModal" 
      class="btn" onclick="updateButtonClicked('${key}')">수정</button>
      <button type="button" class="btn" onclick="deleteComment('${key}')">삭제</button>
    </p>
  </div>
</div>
<div class="row">
  <div class="col-12">
    <p class="text-start fs-5">${comment.content}</p>
  </div>
</div>
<div class="row">
  <div class="col-3"><p class="text-start fs-6">${comment.createdAt}</p></div>
</div></div>`;
  $(".comments").append(commentDivTemplate);
}

// 댓글 리스트에서 댓글 삭제
function clearComment(commentKey) {
  $(`[data-function-arg="${commentKey}"]`).remove();
}

// 댓글 폼 내용 삭제
function clearCommentForm() {
  $("#comment-name").val("");
  $("#comment-content").val("");
}

// 댓글 등록 버튼에 이벤트 등록
// module의 함수는 스코프가 script 태그라서 이렇게 해야함
$(".comment-submit-button").on("click", submitComment);
window.fetchComments = fetchComments;
window.updateComment = updateComment;
window.deleteComment = deleteComment;
window.updateButtonClicked = updateButtonClicked;
window.clearClickedClass = clearClickedClass;
fetchComments();
