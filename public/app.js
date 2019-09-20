(function () {
  let start = 0;
  let idPatch = "";
  let update = false;
  let content = document.querySelector('#responseElement');
  let elementContainer = document.querySelector('#elementContainer');
  let inputTitle = document.querySelector('#inputTitle');
  let inputContent = document.querySelector('#inputContent');
  let inputAuthor = document.querySelector('#inputAuthor');

  const body = document.body;
  const html = document.documentElement;

  // XHTTP Reqeust GET
  xmlReqGet = (start) => {
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        let allElements = "";

        JSON.parse(xhttp.response).forEach(data => {
          let elem = createArticleElement(data);
          allElements += elem;
        });

        elementContainer.innerHTML += allElements;
      }
    };
    xhttp.open("GET", `/articles?_start=${start}&_limit=10`, true);
    xhttp.send();
  };

  // Run Initial
  xmlReqGet(start);

  // XHTTP DELETE
  xmlReqDelete = (id) => {
    const xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        console.log(`Item ${id} removed`);
      }
    };

    xhttp.open("DELETE", `/articles/${id}`, true);
    xhttp.send();
  }

  // xHTTP POST
  xmlReqPost = (input) => {
    const xhttp = new XMLHttpRequest();
    xhttp.open("POST", `/articles`, true);
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.send(JSON.stringify(input));
  }

  // xHTTP PATCH
  xmlReqPatch = (input, id) => {
    const xhttp = new XMLHttpRequest();
    xhttp.open("PATCH", `/articles/${id}`, true);
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.send(JSON.stringify(input));
  }

  // xHTTP GET ONE
  xmlReqGetOne = (id) => {
    idPatch = id;
    // Switch to true to not save new obj
    update = true;

    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        let obj = JSON.parse(xhttp.response);
        let { title, content, author } = obj;

        inputTitle.value = title;
        inputContent.value = content;
        inputAuthor.value = author;
      }
    };
    xhttp.open("GET", `/articles/${id}`, true);
    xhttp.send();
  }

  // Functions *********************************************************************
  // Functions *********************************************************************

  // Scroll load function
  document.addEventListener('scroll', () => {
    if (html.clientHeight + html.scrollTop + 100 > body.offsetHeight) {
      start += 10;
      xmlReqGet(start);
    }
  })

  // Remove item function
  document.addEventListener('click', function (e) {

    // Return if no button
    if (e.target.closest('BUTTON') === null) return;

    // Check if button is remove or update
    if (e.target.closest('BUTTON').getAttribute('data-idDelete')) {
      // Check if button or icon on button is pressed
      if (e.target.tagName === 'BUTTON') {
        xmlReqDelete(e.target.closest('BUTTON').getAttribute('data-idDelete'));
        e.target.parentElement.parentElement.style.opacity = '0';
        setTimeout(function () { e.target.parentElement.parentElement.remove() }, 500);
      }
      else {
        xmlReqDelete(e.target.closest('BUTTON').getAttribute('data-idDelete'));
        e.target.parentElement.parentElement.parentElement.style.opacity = '0';
        setTimeout(function () { e.target.parentElement.parentElement.parentElement.remove() }, 500);
      }
    }
    // Check if update button is pressed
    else if (e.target.closest('BUTTON').getAttribute('data-idUpdate')) {
      xmlReqGetOne(e.target.closest('BUTTON').getAttribute('data-idUpdate'));
    }
  })

  // Create Article
  createArticleElement = (data) => {
    let { content, title, author, created, id } = data;

    created = formatDate(created);

    return (
      `<article>
        <div class="buttons">
        <button data-idDelete="${id}" class="btn btn-delete"><i class="material-icons">delete</i>
        <button data-idUpdate="${id}" class="btn btn-edit"><i class="material-icons">edit</i></button>
        </div>
        <p>ID: ${id}</p> 
        <h3>Title: ${title}</h3>
        <span>Author: ${author}</span>
        <br><br>
        <span>Created: ${created}</span>
        <p>Content: ${content}</p>
      </article>`
    );
  }

  // Formate Date
  formatDate = (created) => {
    let date2 = new Date(created);
    let year = date2.getFullYear();
    let month = date2.getMonth();
    let day = date2.getDate();

    month = String(month).length < 2 ? "0" + month : month;
    day = String(day).length < 2 ? "0" + day : day;

    return created = `${year} - ${month} - ${day}`;
  }


  // Add Post
  document.querySelector('#submitPost').addEventListener('click', function (e) {
    e.preventDefault();

    let input = {
      title: inputTitle.value,
      content: inputContent.value,
      author: inputAuthor.value,
      created: new Date()
    }

    // Save post
    if (update) {
      xmlReqPatch(input, idPatch);
      update = false;
      id = "";
      elementContainer.innerHTML = "";
      start = 0;
      xmlReqGet(start);
    }
    else {
      xmlReqPost(input);
    }

    inputTitle.value = "";
    inputContent.value = "";
    inputAuthor.value = "";
  })

})();