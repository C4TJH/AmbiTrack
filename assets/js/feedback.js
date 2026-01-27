document.addEventListener("DOMContentLoaded", () => {
    const feedbackForm = document.getElementById("feedbackForm");
    const db = firebase.firestore();

    if (feedbackForm) {
        feedbackForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const name = document.getElementById("fbName").value;
            const rating = document.getElementById("fbRating").value;
            const message = document.getElementById("fbMessage").value;
            const submitBtn = feedbackForm.querySelector("button[type='submit']");

            // Validación simple
            if (!rating || !message) {
                Swal.fire("Error", "Por favor completa la calificación y el mensaje.", "error");
                return;
            }

            submitBtn.disabled = true;
            submitBtn.textContent = "Enviando...";

            db.collection("feedback").add({
                name: name || "Anónimo",
                rating: parseInt(rating),
                message: message,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            })
                .then(() => {
                    Swal.fire({
                        title: "¡Gracias!",
                        text: "Tu opinión ha sido enviada exitosamente.",
                        icon: "success",
                        confirmButtonColor: "#00c853"
                    });
                    feedbackForm.reset();
                })
                .catch((error) => {
                    console.error("Error enviando feedback:", error);
                    Swal.fire("Error", "Hubo un problema al enviar tu opinión.", "error");
                })
                .finally(() => {
                    submitBtn.disabled = false;
                    submitBtn.textContent = "Enviar Opinión";
                });
        });
    }
});
