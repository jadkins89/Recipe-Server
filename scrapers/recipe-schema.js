function Recipe() {
  this.name = "";
  this.ingredients = [];
  this.instructions = [];
  this.time = {
    prep: "",
    cook: "",
    active: "",
    inactive: "",
    total: ""
  };
}

module.exports = Recipe;
