(function () {
  let start = 0;
  let idPatch = "";
  let totalPosts = 0;
  let update = false;
  let inputTitle = document.querySelector('#inputTitle');
  let inputAuthor = document.querySelector('#inputAuthor');
  let inputContent = document.querySelector('#inputContent');
  let content = document.querySelector('#responseElement');
  let elementContainer = document.querySelector('#elementContainer');
  const body = document.body;
  const html = document.documentElement;

  // XHTTP Reqeust GET
  const xmlReqGet = (start) => {
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {

        let allElements = "";
        JSON.parse(xhttp.response).forEach(data => {
          let elem = createArticleElement(data);
          allElements += elem;
        });
        elementContainer.innerHTML += allElements;

        totalPosts = Number(xhttp.getResponseHeader('X-Total-Count'));
      };
    };
    xhttp.open("GET", `/articles?_start=${start}&_limit=10`, true);
    xhttp.send();
  };
  // Run Initial
  xmlReqGet(start);

  // XHTTP DELETE
  const xmlReqDelete = (id) => {
    const xhttp = new XMLHttpRequest();
    xhttp.open("DELETE", `/articles/${id}`, true);
    xhttp.send();
  }

  // xHTTP POST
  const xmlReqPost = (input) => {
    const xhttp = new XMLHttpRequest();
    xhttp.open("POST", `/articles`, true);
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.send(JSON.stringify(input));
  }

  // xHTTP PATCH
  const xmlReqPatch = (input, id) => {
    const xhttp = new XMLHttpRequest();
    xhttp.open("PATCH", `/articles/${id}`, true);
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.send(JSON.stringify(input));
  }

  // xHTTP GET ONE
  const xmlReqGetOne = (id) => {
    idPatch = id;
    update = true;
    // Switch to true to not save new obj
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
  // Debounce
  const debounce = (func, wait = 20, immediate = true) => {
    var timeout;
    return function () {
      var context = this, args = arguments;
      var later = function () {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  };

  // Scroll load function
  const scrollPostLoad = () => {
    // Check if all posts are loaded
    if (start + 10 > totalPosts) return;
    if (html.clientHeight + html.scrollTop + 100 > body.offsetHeight) {
      start += 10;
      xmlReqGet(start);
    }
  }
  window.addEventListener('scroll', debounce(scrollPostLoad));

  // Remove item
  document.addEventListener('click', function (e) {
    if (e.target.closest('BUTTON') === null) return;

    // Check if button is remove or update
    if (e.target.closest('BUTTON').getAttribute('data-idDelete')) {
      let deleteBtn = e.target.parentElement.parentElement;
      let deleteBtnIcon = e.target.parentElement.parentElement.parentElement;

      // Check if button or icon on button is pressed
      if (e.target.tagName === 'BUTTON') {
        xmlReqDelete(e.target.closest('BUTTON').getAttribute('data-idDelete'));
        deleteBtn.style.opacity = '0';
        setTimeout(function () { deleteBtn.remove() }, 500);
      }
      else {
        xmlReqDelete(e.target.closest('BUTTON').getAttribute('data-idDelete'));
        deleteBtnIcon.style.opacity = '0';
        setTimeout(function () { deleteBtnIcon.remove() }, 500);
      }
    }
    // Check if update button is pressed
    else if (e.target.closest('BUTTON').getAttribute('data-idUpdate')) {
      xmlReqGetOne(e.target.closest('BUTTON').getAttribute('data-idUpdate'));
    }
  })

  // Create Article
  const createArticleElement = (data) => {
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
  const formatDate = (created) => {
    let date2 = new Date(created);
    let year = date2.getFullYear();
    let month = date2.getMonth();
    let day = date2.getDate();

    month = String(month).length < 2 ? "0" + month : month;
    day = String(day).length < 2 ? "0" + day : day;

    return created = `${year} - ${month} - ${day}`;
  }


  // Add Post
  document.querySelector('#submitPost').addEventListener('click', e => {
    e.preventDefault();

    let input = {
      title: inputTitle.value,
      content: inputContent.value,
      author: inputAuthor.value,
      created: new Date()
    }

    // Check if update or new post / Save post
    if (update) {
      xmlReqPatch(input, idPatch);
      update = false;
      id = "";
      elementContainer.innerHTML = "";
      start = 0;
      xmlReqGet(start);
    }
    else xmlReqPost(input);

    inputTitle.value = "";
    inputContent.value = "";
    inputAuthor.value = "";
  })

})();