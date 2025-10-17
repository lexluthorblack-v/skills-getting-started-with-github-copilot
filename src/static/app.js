document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

  // Clear loading message
  activitiesList.innerHTML = "";

  // Clear select options (except placeholder)
  activitySelect.querySelectorAll('option:not([value=""])').forEach(o => o.remove());

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // Title and metadata
        const title = document.createElement("h4");
        title.textContent = name;
        const desc = document.createElement("p");
        desc.textContent = details.description;
        const schedule = document.createElement("p");
        schedule.innerHTML = `<strong>Schedule:</strong> ${details.schedule}`;
        const availability = document.createElement("p");
        availability.innerHTML = `<strong>Availability:</strong> ${spotsLeft} spots left`;

        // Participants section
        const participantsSection = document.createElement("div");
        participantsSection.className = "participants-section";
        const participantsHeader = document.createElement("p");
        participantsHeader.innerHTML = `<strong>Participants:</strong>`;
        participantsSection.appendChild(participantsHeader);

        if (details.participants && details.participants.length > 0) {
          const ul = document.createElement("ul");
          ul.className = "participants-list";
          details.participants.forEach((p) => {
            const li = document.createElement("li");

            // Participant label
            const span = document.createElement("span");
            span.className = "participant-email";
            span.textContent = p;
            li.appendChild(span);

            // Delete button (icon)
            const delBtn = document.createElement("button");
            delBtn.className = "participant-delete";
            delBtn.setAttribute("aria-label", `Remove ${p}`);
            delBtn.innerHTML = `\u2716`;
            delBtn.addEventListener("click", async () => {
              try {
                const resp = await fetch(
                  `/activities/${encodeURIComponent(name)}/participants?email=${encodeURIComponent(p)}`,
                  { method: "DELETE" }
                );

                const resJson = await resp.json();
                if (resp.ok) {
                  // Refresh activities to reflect removal
                  fetchActivities();
                  messageDiv.textContent = resJson.message;
                  messageDiv.className = "success";
                } else {
                  messageDiv.textContent = resJson.detail || "Failed to remove participant";
                  messageDiv.className = "error";
                }
                messageDiv.classList.remove("hidden");
                setTimeout(() => messageDiv.classList.add("hidden"), 4000);
              } catch (err) {
                console.error("Error removing participant:", err);
                messageDiv.textContent = "Failed to remove participant";
                messageDiv.className = "error";
                messageDiv.classList.remove("hidden");
              }
            });

            li.appendChild(delBtn);
            ul.appendChild(li);
          });
          participantsSection.appendChild(ul);
        } else {
          const none = document.createElement("p");
          none.className = "info";
          none.textContent = "No participants yet";
          participantsSection.appendChild(none);
        }

        activityCard.appendChild(title);
        activityCard.appendChild(desc);
        activityCard.appendChild(schedule);
        activityCard.appendChild(availability);
        activityCard.appendChild(participantsSection);

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();

        // Refresh activities so the newly signed-up participant appears
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
