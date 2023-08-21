const books = [];
const RENDER_EVENT = "render-book";
const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOK_APPS';

document.addEventListener("DOMContentLoaded", function () {
  const submitForm = document.getElementById("inputBook");
  submitForm.addEventListener("submit", function (event) {
    event.preventDefault();
    addBook();
    alert('List Book Ditambahkan!');
  });
  
  if (isStorageExist()){
    loadDataFromStorage();
  }

});

document.addEventListener(SAVED_EVENT, function(){
  console.log(localStorage.getItem(STORAGE_KEY));
});

document.addEventListener(RENDER_EVENT, function () {
  const uncompletedBOOKList = document.getElementById(
    "incompleteBookshelfList"
  );
  uncompletedBOOKList.innerHTML = "";

  const completedBOOKList = document.getElementById("completeBookshelfList");
  completedBOOKList.innerHTML = "";

  for (const bookItem of books) {
    const bookElement = makeBook(bookItem);
    if (!bookItem.isRead) uncompletedBOOKList.append(bookElement);
    else completedBOOKList.append(bookElement);
  }
});

document.getElementById('searchBook').addEventListener('submit', function(event){
  event.preventDefault();
  const searchBook = document.getElementById('searchBookTitle').value.toLowerCase();
  const bookList = document.querySelectorAll('.book_item > h3');

  for (const book of bookList){
    if (book.innerText.toLowerCase().includes(searchBook)){
      book.parentElement.parentElement.style.display = 'block';
    } else {
      book.parentElement.parentElement.style.display = 'none';
    }
  }
});

const checkbox = document.getElementById('inputBookIsComplete');
let check = false;

checkbox.addEventListener("change", function(){
  if (checkbox.checked){
    check = true;
  
  document.querySelector('span').innerText = "Selesai dibaca";
  } else{
    check = false;
  document.querySelector('span').innerText = "Belum selesai dibaca";
  }
});


function addBook() {
  const inputTitle = document.getElementById("inputBookTitle").value;
  const inputAuthor = document.getElementById("inputBookAuthor").value;
  const inputYear = document.getElementById("inputBookYear").valueAsNumber;
  const isRead = document.getElementById('inputBookIsComplete').checked;

  const generateID = generateId();
  const newBookObj = generateNewBookObj(
    generateID,
    inputTitle,
    inputAuthor,
    inputYear,
    isRead
  );
  books.push(newBookObj);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function generateId() {
  return +new Date();
}

function generateNewBookObj(
  id,
  inputBookTitle,
  inputBookAuthor,
  inputBookYear,
  isRead
) {
  return {
    id,
    inputBookTitle,
    inputBookAuthor,
    inputBookYear,
    isRead,
  };
}

function makeBook(newBookObj) {
  const inputTitle = document.createElement("h3");
  inputTitle.innerText = newBookObj.inputBookTitle;

  const inputAuthor = document.createElement("p");
  inputAuthor.innerText = " Penulis = " + newBookObj.inputBookAuthor;

  const inputYear = document.createElement("p");
  inputYear.innerText = " Tahun Terbit = " + newBookObj.inputBookYear;

  const countainer = document.createElement("article");
  countainer.classList.add("book_item");
  countainer.append(inputTitle, inputAuthor, inputYear);
  countainer.setAttribute("id", `book-${newBookObj.id}`);

  if (newBookObj.isRead) {
    const undoButton = document.createElement("button");
    undoButton.classList.add("green");
    undoButton.setAttribute("id", "button-undo");
    undoButton.innerText = "Belum Selesai";

    undoButton.addEventListener("click", function () {
      if (confirm("Anda Ingin Memindahkan buku ke daftar belum selsai?")) {
        undoBookToCompleted(newBookObj.id);
      }
    });

    const trashButton = document.createElement("button");
    trashButton.classList.add("red");
    trashButton.setAttribute("id", "trash-button");
    trashButton.innerText = "Hapus Buku!";

    trashButton.addEventListener("click", function () {
      if (confirm("Anda Yakin Ingin Menghapus Buku ini!")) {
        removeBookToCompleted(newBookObj.id);
      }
    });

    countainer.append(undoButton, trashButton);
  } else {
    const undoButton = document.createElement("button");
    undoButton.classList.add("green");
    undoButton.setAttribute("id", "button-undo");
    undoButton.innerText = "Sudah Selesai";

    undoButton.addEventListener("click", function () {
      if (confirm("Anda Ingin Memindahkan Buku di Rak Selesai?")) {
        addBookToCompleted(newBookObj.id);
      }
    });

    const trashButton = document.createElement("button");
    trashButton.classList.add("red");
    trashButton.setAttribute("id", "trash-button");
    trashButton.innerText = "Hapus Buku";

    trashButton.addEventListener("click", function () {
      if (confirm("Anda Yakin Ingin Menghapus Buku Tersebut?")) {
        removeBookToCompleted(newBookObj.id);
        alert("Buku Tersebut Telah Terhapus!");
      }
    });
    countainer.append(undoButton, trashButton);
  }

  return countainer;
}

function addBookToCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isRead = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function findBook(bookId) {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return;
}

function undoBookToCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isRead = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function removeBookToCompleted(bookId) {
  const bookTarget = findBookIndex(bookId);

  if (bookTarget === -1) return;

  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }

  return -1;
}

function saveData(){
  if (isStorageExist()){
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function isStorageExist(){
  if (typeof (Storage) === undefined){
    alert('Yah Browser nya gak Mendukung nih!');
    return false;
  } 
  return true;
}

function loadDataFromStorage(){
  const serializedData =  localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null){
    for (const book of data){
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}




