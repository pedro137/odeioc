// PaginaDesejada.js

import { Link } from "react-router-dom";
import { auth } from "../../services/firebaseConfig";
import React, { useState, useEffect } from "react";
import { db } from "../../services/firebaseConfig";
import { uid } from "uid";
import { set, ref, onValue, remove, update } from "firebase/database";
import "./styles1.css";
import "./styles2.css";


const genresOptions = [
  'Romance',
  'Ficção Científica',
  'Fantasia',
  'Mistério',
  'Suspense',
  'Terror',
  'Aventura',
  'Biografia',
  'História',
];


export function PaginaDesejada() {

  const [todo, setTodo] = useState("");
  const [author, setAuthor] = useState("");
  const [genre, setGenre] = useState("");
  const [todos, setTodos] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [tempUuid, setTempUuid] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [isEditDetails, setIsEditDetails] = useState(false);
  const [errorMessage, setErrorMessage] = useState(""); // Variável para armazenar a mensagem de erro
  const [invalidFields, setInvalidFields] = useState([]);



 // Estilos adicionados para a tabela e botões
 const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: "18px",
  textAlign: "left",
  color: "white",
};


const thStyle = {
  backgroundColor: "#00CCCC",
  padding: "12px",
  border: "1px solid white",
};

const tdStyle = {
   backgroundColor: "#3d4d5f",
   color:"white",
  padding: "12px",
  border: "1px solid white",
};

const buttonStyle = {
  backgroundColor: "white",
  color: "black",
  padding: "8px 12px",
  fontSize: "16px",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  marginRight: "8px",
};
const buttonStyle1 = {
  backgroundColor: "#2E8B57",
  color: "white",
  padding: "8px 12px",
  fontSize: "16px",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  marginRight: "8px",
};



  // Estilos para a tabela de impressão
  const printTableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "18px",
    textAlign: "left",
  };

  const printThStyle = {
    backgroundColor: "#007bff",
    color: "#fff",
    padding: "12px",
  };

  const printTdStyle = {
    padding: "12px",
    border: "1px solid #ccc",
  };

  // Função para imprimir a tabela
  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write("<html><head><title>Imprimir Tabela</title>");
    printWindow.document.write('<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css"></head><body>');

    // Tabela de impressão
    printWindow.document.write("<table style='" + Object.entries(printTableStyle).map(([key, value]) => `${key}:${value}`).join(';') + "'>");
    printWindow.document.write("<thead><tr>");
    printWindow.document.write("<th style='" + Object.entries(printThStyle).map(([key, value]) => `${key}:${value}`).join(';') + "'>Livro</th>");
    printWindow.document.write("<th style='" + Object.entries(printThStyle).map(([key, value]) => `${key}:${value}`).join(';') + "'>Autor</th>");
    printWindow.document.write("<th style='" + Object.entries(printThStyle).map(([key, value]) => `${key}:${value}`).join(';') + "'>Gênero</th>");
    printWindow.document.write("</tr></thead><tbody>");
    todos.forEach((todo) => {
      printWindow.document.write("<tr>");
      printWindow.document.write("<td style='" + Object.entries(printTdStyle).map(([key, value]) => `${key}:${value}`).join(';') + "'>" + todo.todo + "</td>");
      printWindow.document.write("<td style='" + Object.entries(printTdStyle).map(([key, value]) => `${key}:${value}`).join(';') + "'>" + todo.author + "</td>");
      printWindow.document.write("<td style='" + Object.entries(printTdStyle).map(([key, value]) => `${key}:${value}`).join(';') + "'>" + todo.genre + "</td>");
      printWindow.document.write("</tr>");
    });
    printWindow.document.write("</tbody></table>");

    // Botão de impressão

    printWindow.document.write("</body></html>");
    printWindow.document.close();

    // Fecha a janela de impressão após imprimir
    printWindow.onafterprint = () => {
      printWindow.close();
    };

    // Abre a janela de impressão
    printWindow.print();
  };

  

  const handleTodoChange = (e) => {
    setTodo(e.target.value);
  };

  const handleAuthorChange = (e) => {
    setAuthor(e.target.value);
  };

  const handleGenreChange = (e) => {
    setGenre(e.target.value);
  };


  useEffect(() => {
    if (!showModal) {
      setInvalidFields([]);
    }
  }, [showModal]);


  // Read
  useEffect(() => {
    onValue(ref(db), (snapshot) => {
      setTodos([]);
      const data = snapshot.val();
      if (data !== null) {
        Object.values(data).map((todo) => {
          setTodos((oldArray) => [...oldArray, todo]);
        });
      }
    });
  }, []);

  // Write - Adicionar livro
  const writeToDatabase = () => {
    // Remove espaços extras no início e no fim dos valores
    const trimmedTodo = todo.trim();
    const trimmedAuthor = author.trim();
    const trimmedGenre = genre.trim();

    if (!trimmedTodo || !trimmedAuthor || !trimmedGenre) {
      setErrorMessage("Preencha todos os campos.");
      setInvalidFields(
        ['formTodo', 'formAuthor', 'formGenre']
          .filter((field) => !trimmedTodo && field === 'formTodo')
          .concat(
            ['formTodo', 'formAuthor', 'formGenre'].filter((field) => !trimmedAuthor && field === 'formAuthor')
          )
          .concat(
            ['formTodo', 'formAuthor', 'formGenre'].filter((field) => !trimmedGenre && field === 'formGenre')
          )
      );
      return;
    }

    setErrorMessage("");
    setInvalidFields([]);

    const uuid = uid();
    set(ref(db, `/${uuid}`), {
      todo: trimmedTodo,
      author: trimmedAuthor,
      genre: trimmedGenre,
      uuid,
    });

    setTodo("");
    setAuthor("");
    setGenre("");
    setShowModal(false);
  };

  // Update - Editar livro
  const handleEdit = () => {
    // Remove espaços extras no início e no fim dos valores
    const trimmedTodo = todo.trim();
    const trimmedAuthor = author.trim();
    const trimmedGenre = genre.trim();

    if (!trimmedTodo || !trimmedAuthor || !trimmedGenre) {
      setErrorMessage("Preencha todos os campos.");
      setInvalidFields(
        ['formTodo', 'formAuthor', 'formGenre']
          .filter((field) => !trimmedTodo && field === 'formTodo')
          .concat(
            ['formTodo', 'formAuthor', 'formGenre'].filter((field) => !trimmedAuthor && field === 'formAuthor')
          )
          .concat(
            ['formTodo', 'formAuthor', 'formGenre'].filter((field) => !trimmedGenre && field === 'formGenre')
          )
      );
      return;
    }

    setErrorMessage("");
    setInvalidFields([]);

    update(ref(db, `/${tempUuid}`), {
      todo: trimmedTodo,
      author: trimmedAuthor,
      genre: trimmedGenre,
      uuid: tempUuid,
    });

    setTodo("");
    setAuthor("");
    setGenre("");
    setShowModal(false);
    setIsEdit(false);
  };

  // Delete
  const handleDelete = (todo) => {
    remove(ref(db, `/${todo.uuid}`));
  };

  const handleCloseModal = () => {
    if (isEdit) {
      setTodo("");
      setAuthor("");
      setGenre("");
      setIsEdit(false);
    }
    setShowModal(false);
    setErrorMessage("");
    setInvalidFields([]);
  };

  const handleViewDetails = (book) => {
    setSelectedBook(book);
    setShowModal(true);
  };

  const handleEditDetails = () => {
    setIsEditDetails(true);
  };

  const handleSaveChanges = () => {
    // Remove espaços extras no início e no fim dos valores
    const trimmedTodo = selectedBook.todo.trim();
    const trimmedAuthor = selectedBook.author.trim();
    const trimmedGenre = selectedBook.genre.trim();

    if (!trimmedTodo || !trimmedAuthor || !trimmedGenre) {
      setErrorMessage("Preencha todos os campos.");
      setInvalidFields(
        ['formTodo', 'formAuthor', 'formGenre']
          .filter((field) => !trimmedTodo && field === 'formTodo')
          .concat(
            ['formTodo', 'formAuthor', 'formGenre'].filter((field) => !trimmedAuthor && field === 'formAuthor')
          )
          .concat(
            ['formTodo', 'formAuthor', 'formGenre'].filter((field) => !trimmedGenre && field === 'formGenre')
          )
      );
      return;
    }

    setErrorMessage("");
    setInvalidFields([]);

    update(ref(db, `/${selectedBook.uuid}`), {
      todo: trimmedTodo,
      author: trimmedAuthor,
      genre: trimmedGenre,
      uuid: selectedBook.uuid,
    });

    setIsEditDetails(false);
  };

  const handleDeleteBook = () => {
    if (selectedBook && selectedBook.uuid) {
      remove(ref(db, `/${selectedBook.uuid}`))
        .then(() => {
          setShowModal(false);
          setSelectedBook(null);
        })
        .catch((error) => {
          console.error("Erro ao excluir livro:", error);
        });
    }
  };

  const handleCloseDetailsModal = () => {
    setSelectedBook(null);
    setShowModal(false);
    setIsEditDetails(false);
    setErrorMessage('')
  };

  function handleSignOut() {
    auth.signOut()
      .then(() => {
        // Você pode redirecionar para qualquer rota aqui, neste exemplo, redirecionaremos para a página de login
      })
      .catch((error) => {
        console.error("Erro ao fazer logout:", error);
      });
  }

  return (
    
    <div style={{ backgroundColor: "#3d4d5f", minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div className="logout-container">
        <button onClick={handleSignOut} className="btn btn-danger">Sair</button>
      </div>
       <div className="container" style={{ backgroundColor: "#3d4d5f", padding: "20px", borderRadius: "8px" }}>
    <div className="my-3">
      {/* Botão para abrir o modal de adicionar */}
      {!isEdit ? (
        <>
          <button className="btn btn-primary me-2" style={buttonStyle1} onClick={() => setShowModal(true)}>Adicionar livro</button>
        </>
      ) : (
        <>
          <button className="btn btn-primary me-2" onClick={handleEdit}>Salvar mudanças</button>
          <button className="btn btn-secondary" onClick={handleCloseModal}>Cancelar</button>
        </>
      )}
    </div>
    <table className={`table noHover`} style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Livro</th>
              <th style={thStyle}>Autor</th>
              <th style={thStyle}>Gênero</th>
              <th style={thStyle}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {todos.map((todo) => (
              <tr key={todo.uuid}>
                <td style={tdStyle}>{todo.todo}</td>
                <td style={tdStyle}>{todo.author}</td>
                <td style={tdStyle}>{todo.genre}</td>
                <td style={tdStyle}>
                  {/* Botão para abrir o modal de detalhes */}
                  <button className="btn btn-secondary" style={buttonStyle} onClick={() => handleViewDetails(todo)}>Ver dados</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
    <button className="btn btn-secondary" onClick={handlePrint}>
      Imprimir
    </button>

    {/* Modal de adicionar/editar */}
    {showModal && (
      <div className="modal" tabIndex="-1" style={{ display: "block", backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{isEdit ? "Editar livro" : "Adicionar livro"}</h5>
              <button type="button" className="btn-close" onClick={handleCloseModal}></button>
            </div>
            <div className="modal-body">
              <div className={`mb-3 ${invalidFields.includes('formTodo') || errorMessage ? "has-error" : ""}`}>
                <label htmlFor="modalTodo" className={`form-label ${invalidFields.includes('formTodo') ? "text-danger" : ""}`}>Livro*</label>
                <input
                  type="text"
                  id="modalTodo"
                  className={`form-control ${invalidFields.includes('formTodo') ? "is-invalid" : ""}`}
                  value={todo}
                  onChange={handleTodoChange}
                />
              </div>
              <div className={`mb-3 ${invalidFields.includes('formAuthor') || errorMessage ? "has-error" : ""}`}>
                <label htmlFor="modalAuthor" className={`form-label ${invalidFields.includes('formAuthor') ? "text-danger" : ""}`}>Autor*</label>
                <input
                  type="text"
                  id="modalAuthor"
                  className={`form-control ${invalidFields.includes('formAuthor') ? "is-invalid" : ""}`}
                  value={author}
                  onChange={handleAuthorChange}
                />
              </div>
              <div className={`mb-3 ${invalidFields.includes('formGenre') || errorMessage ? "has-error" : ""}`}>
                <label htmlFor="modalGenre" className={`form-label ${invalidFields.includes('formGenre') ? "text-danger" : ""}`}>Gênero*</label>
                <select
                  id="modalGenre"
                  className={`form-select ${invalidFields.includes('formGenre') ? "is-invalid" : ""}`}
                  value={genre}
                  onChange={handleGenreChange}
                >
                  <option value="" disabled>Selecione o gênero</option>
                  {genresOptions.map((genre) => (
                    <option key={genre} value={genre}>{genre}</option>
                  ))}
                </select>
              </div>
              {errorMessage && <div className="alert alert-danger" role="alert">{errorMessage}</div>}
            </div>
            <div className="modal-footer">
              {isEdit ? (
                <>
                  <button type="button" className="btn btn-primary" onClick={handleEdit}>Salvar mudanças</button>
                  <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Cancelar</button>
                </>
              ) : (
                <>
                  <button type="button" className="btn btn-primary" onClick={writeToDatabase}>Adicionar</button>
                  <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Cancelar</button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Modal de ver detalhes */}
    {selectedBook && (
      <div className="modal" tabIndex="-1" style={{ display: "block", backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Detalhes do livro</h5>
              <button type="button" className="btn-close" onClick={handleCloseDetailsModal}></button>
            </div>
            <div className="modal-body">
              <div className={`mb-3 ${invalidFields.includes('formTodo') || errorMessage ? "has-error" : ""}`}>
                <label htmlFor="modalTodo" className={`form-label ${invalidFields.includes('formTodo') ? "text-danger" : ""}`}>Livro*</label>
                <input
                  type="text"
                  id="modalTodo"
                  className={`form-control ${invalidFields.includes('formTodo') ? "is-invalid" : ""}`}
                  value={selectedBook.todo}
                  readOnly={!isEditDetails}
                  onChange={(e) => setSelectedBook({ ...selectedBook, todo: e.target.value })}
                />
              </div>
              <div className={`mb-3 ${invalidFields.includes('formAuthor') || errorMessage ? "has-error" : ""}`}>
                <label htmlFor="modalAuthor" className={`form-label ${invalidFields.includes('formAuthor') ? "text-danger" : ""}`}>Autor*</label>
                <input
                  type="text"
                  id="modalAuthor"
                  className={`form-control ${invalidFields.includes('formAuthor') ? "is-invalid" : ""}`}
                  value={selectedBook.author}
                  readOnly={!isEditDetails}
                  onChange={(e) => setSelectedBook({ ...selectedBook, author: e.target.value })}
                />
              </div>
              <div className={`mb-3 ${invalidFields.includes('formGenre') || errorMessage ? "has-error" : ""}`}>
                <label htmlFor="modalGenre" className={`form-label ${invalidFields.includes('formGenre') ? "text-danger" : ""}`}>Gênero*</label>
                <select
                  id="modalGenre"
                  className={`form-select ${invalidFields.includes('formGenre') ? "is-invalid" : ""}`}
                  value={selectedBook.genre}
                  readOnly={!isEditDetails}
                  onChange={(e) => setSelectedBook({ ...selectedBook, genre: e.target.value })}
                >
                  <option value="" disabled>Selecione o gênero</option>
                  {genresOptions.map((genre) => (
                    <option key={genre} value={genre}>{genre}</option>
                  ))}
                </select>
              </div>
              {errorMessage && <div className="alert alert-danger" role="alert">{errorMessage}</div>}
            </div>
            <div className="modal-footer">
              {!isEditDetails ? (
                <>
                  <button type="button" className="btn btn-primary" onClick={handleEditDetails}>Editar</button>
                  <button type="button" className="btn btn-danger" onClick={handleDeleteBook}>Excluir</button>
                  <button type="button" className="btn btn-secondary" onClick={handleCloseDetailsModal}>Fechar</button>
                </>
              ) : (
                <>
                  <button type="button" className="btn btn-primary" onClick={handleSaveChanges}>Salvar mudanças</button>
                  <button type="button" className="btn btn-secondary" onClick={handleCloseDetailsModal}>Fechar</button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    )}
    
  </div>

  </div>
);

}