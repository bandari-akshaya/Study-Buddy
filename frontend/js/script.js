// =========================================
// AI STUDY BUDDY
// Part 1
// =========================================

const API = "";

const $ = (id) => document.querySelector(id);
const $$ = (id) => document.querySelectorAll(id);

const history = [];

const loader = $("#loader");

// ----------------------
// Navigation
// ----------------------

$$(".nav-btn").forEach(btn => {

    btn.addEventListener("click", () => {

        $$(".nav-btn").forEach(b => b.classList.remove("active"));
        $$(".tab").forEach(tab => tab.classList.remove("active"));

        btn.classList.add("active");
        $("#" + btn.dataset.tab).classList.add("active");

    });

});

// ----------------------
// Loader
// ----------------------

function showLoader(){

    loader.classList.remove("hidden");

}

function hideLoader(){

    loader.classList.add("hidden");

}

// ----------------------
// Chat Message
// ----------------------

function addMessage(role,text){

    const wrapper=document.createElement("div");

    wrapper.className="msg "+role;

    if(role==="assistant"){

        wrapper.innerHTML=`

        <div class="avatar">🤖</div>

        <div class="bubble"></div>

        `;

        wrapper.querySelector(".bubble").innerHTML=marked.parse(text);

        hljs.highlightAll();

    }

    else{

        wrapper.innerHTML=`

        <div class="bubble"></div>

        `;

        wrapper.querySelector(".bubble").textContent=text;

    }

    $("#chat-log").appendChild(wrapper);

    $("#chat-log").scrollTop=$("#chat-log").scrollHeight;

}

// ----------------------
// Typing Animation
// ----------------------

async function typingMessage(text){

    const wrapper=document.createElement("div");

    wrapper.className="msg assistant";

    wrapper.innerHTML=`

        <div class="avatar">🤖</div>

        <div class="bubble"></div>

    `;

    $("#chat-log").appendChild(wrapper);

    const bubble=wrapper.querySelector(".bubble");

    let current="";

    for(let i=0;i<text.length;i++){

        current+=text[i];

        bubble.innerHTML=marked.parse(current);

        $("#chat-log").scrollTop=$("#chat-log").scrollHeight;

        await new Promise(r=>setTimeout(r,8));

    }

    hljs.highlightAll();

}

// ----------------------
// Chat
// ----------------------

$("#chat-form").addEventListener("submit",async(e)=>{

    e.preventDefault();

    const message=$("#chat-input").value.trim();

    if(message==="") return;

    addMessage("user",message);

    history.push({

        role:"user",

        content:message

    });

    $("#chat-input").value="";

    showLoader();

    try{

        const response=await fetch(API+"/api/chat/",{

            method:"POST",

            headers:{

                "Content-Type":"application/json"

            },

            body:JSON.stringify({

                message:message,

                history:history.slice(0,-1)

            })

        });

        const data=await response.json();

        hideLoader();

        const reply=data.reply || "No response.";

        await typingMessage(reply);

        history.push({

            role:"assistant",

            content:reply

        });

    }

    catch(err){

        hideLoader();

        addMessage(

            "assistant",

            "❌ Unable to connect to the server."

        );

    }

});

// ----------------------
// Copy Code Button
// ----------------------

function addCopyButtons(){

    document.querySelectorAll("pre").forEach(pre=>{

        if(pre.querySelector("button")) return;

        const btn=document.createElement("button");

        btn.innerText="Copy";

        btn.className="copy-btn";

        btn.onclick=()=>{

            navigator.clipboard.writeText(pre.innerText);

            btn.innerText="Copied!";

            setTimeout(()=>{

                btn.innerText="Copy";

            },1500);

        };

        pre.appendChild(btn);

    });

}

setInterval(addCopyButtons,1000);
// =========================================
// QUIZ
// =========================================

let totalQuestions = 0;
let answered = 0;
let score = 0;

$("#quiz-form").addEventListener("submit", async (e) => {

    e.preventDefault();

    $("#quiz-output").innerHTML = "";
    $("#quiz-result").style.display = "none";

    answered = 0;
    score = 0;

    showLoader();

    try {

        const response = await fetch(API + "/api/quiz/generate", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                topic: $("#quiz-topic").value,

                num_questions: Number($("#quiz-num").value)

            })

        });

        const data = await response.json();

        hideLoader();

        totalQuestions = data.questions.length;

        updateProgress();

        data.questions.forEach((q, index) => {

            const card = document.createElement("div");

            card.className = "q-card";

            let html = `
                <strong>Q${index + 1}. ${q.question}</strong>
            `;

            q.options.forEach((option, i) => {

                html += `
                    <label class="opt">
                        <input type="radio" name="q${index}" value="${i}">
                        ${option}
                    </label>
                `;

            });

            html += `<div class="explain" style="display:none;"></div>`;

            card.innerHTML = html;

            card.addEventListener("change", function (e) {

                const inputs = card.querySelectorAll("input");

                inputs.forEach(x => x.disabled = true);

                const chosen = Number(e.target.value);

                const labels = card.querySelectorAll(".opt");

                labels[q.answer_index].classList.add("correct");

                if (chosen != q.answer_index) {

                    labels[chosen].classList.add("wrong");

                } else {

                    score++;

                }

                answered++;

                updateProgress();

                const explain = card.querySelector(".explain");

                explain.style.display = "block";

                explain.innerHTML = "💡 " + q.explanation;

                if (answered === totalQuestions) {

                    showResult();

                }

            });

            $("#quiz-output").appendChild(card);

        });

    }

    catch {

        hideLoader();

        alert("Unable to generate quiz.");

    }

});

function updateProgress() {

    const percent = totalQuestions == 0 ? 0 :

        (answered / totalQuestions) * 100;

    $("#progress-fill").style.width = percent + "%";

    $("#progress-text").textContent =
        answered + " / " + totalQuestions + " Completed";

}

function showResult() {

    const percent = Math.round(score / totalQuestions * 100);

    let message = "";

    if (percent >= 90)
        message = "🌟 Excellent";

    else if (percent >= 70)
        message = "👏 Good Job";

    else if (percent >= 50)
        message = "🙂 Keep Practicing";

    else
        message = "📚 Practice More";

    $("#quiz-result").style.display = "block";

    $("#quiz-result").innerHTML = `

        <h2>Quiz Completed 🎉</h2>

        <div class="score">${score}/${totalQuestions}</div>

        <div class="result-text">${message}</div>

        <div class="result-details">

            Percentage : ${percent}% <br>

            Correct : ${score} <br>

            Wrong : ${totalQuestions-score}

        </div>

    `;

}

// =========================================
// NOTES
// =========================================

async function loadNotes() {

    const response = await fetch(API + "/api/notes/");

    const notes = await response.json();

    displayNotes(notes);

}

function displayNotes(notes) {

    const search = $("#search-notes").value.toLowerCase();

    $("#notes-list").innerHTML = "";

    notes
        .filter(note =>
            note.title.toLowerCase().includes(search) ||
            note.content.toLowerCase().includes(search)
        )
        .forEach(note => {

            const div = document.createElement("div");

            div.className = "note";

            div.innerHTML = `

                <h3>${note.title}</h3>

                <p>${note.content}</p>

                ${
                    note.summary
                    ?
                    `<details open>

                        <summary>AI Summary</summary>

                        <pre>${note.summary}</pre>

                    </details>`
                    :
                    ""
                }

                <button onclick="deleteNote(${note.id})">

                    Delete

                </button>

            `;

            $("#notes-list").appendChild(div);

        });

}

$("#notes-form").addEventListener("submit", async function (e) {

    e.preventDefault();

    showLoader();

    await fetch(API + "/api/notes/", {

        method: "POST",

        headers: {

            "Content-Type": "application/json"

        },

        body: JSON.stringify({

            title: $("#note-title").value,

            content: $("#note-content").value,

            summarize: $("#note-summarize").checked

        })

    });

    hideLoader();

    this.reset();

    loadNotes();

});

window.deleteNote = async function (id) {

    await fetch(API + "/api/notes/" + id, {

        method: "DELETE"

    });

    loadNotes();

}

$("#search-notes").addEventListener("keyup", loadNotes);

loadNotes();

// =========================================
// END
// =========================================