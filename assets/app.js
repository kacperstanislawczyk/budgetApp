var budgetController = (function () {

  var Expense = function(id, description, value){
    this.id = id;
    this.description = description;
    this.value = value;

  };

  var Income = function(id, description, value){
    this.id = id;
    this.description = description;
    this.value = value;

  };

  var calculateTotal = function(type){
    var sum = 0;
    data.allItems[type].forEach(function(currentElement){
      sum = sum+currentElement.value;
    });

    data.totals[type] = sum;

  };

  var data = {
    allItems: {
      exp: [],
      inc: []
    },
    totals: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    percentage: -1
  }; 




  return {
    addItem: function(type, des, val){
      var newItem, ID;

      //create new id
      if (data.allItems[type].length > 0){
        ID = data.allItems[type][data.allItems[type].length - 1].id+1;
      } else {
        ID = 0;
      }
      

      //create new item 'inc' or 'exp' type
      if (type === 'exp'){
        newItem = new Expense(ID, des, val);
      } else if (type === 'inc'){
        newItem = new Income(ID, des, val);
      };

      //push into data structure
      data.allItems[type].push(newItem);

      //return new element
      return newItem;
    },

    calculateBudget: function(){

      // calculate total income and expenses
      calculateTotal('exp');
      calculateTotal('inc');

      // calculate budget: income - expenses
      data.budget = data.totals['inc'] - data.totals['exp'];

      // calculate the percentage of income that we spent
      if (data.totals.inc > 0){
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }

    },

    getBudget: function(){
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage
      };
    },

    deleteItem: function(type, id){
      var ids, index;      

      ids = data.allItems[type].map(function(current){
        return current.id;
      });

      index = ids.indexOf(id);

      if (index !== -1){
        data.allItems[type].splice(index, 1)
      }


    },

    calculatePercentages: function(){
      var percentage;

      for (var i = 0; i < data.allItems.exp.length; i++){
        
        if (data.totals.inc > 0){
          percentage = Math.round((data.allItems.exp[i].value/data.totals.inc) * 100);
        } else {
          percentage = -1;
        }

        data.allItems.exp[i].percentage = percentage;
        
      }
      
    },

    getPercentagesAndIDs: function(){
      var percentagesIDs = [];

      for (var i = 0; i < data.allItems.exp.length; i++){
        percentagesIDs.push({
          id: data.allItems.exp[i].id,
          percentage: data.allItems.exp[i].percentage
        })
      }

      return percentagesIDs;

    },

    testing: function(){
      console.log(data);
    }
  }


})();


var UIController = (function () {
  var DOMstrings = {
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    inputButton: '.add__btn',
    incomeContainer: '.income__list',
    expensesContainer: '.expenses__list',
    budgetLabel: '.budget__value',
    incomeLabel: '.budget__income--value',
    expensesLabel: '.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage',
    container: '.container',
    dateLabel: '.budget__title--month'
  };

  var formatNumber = function(num, type){
    var numSplit, int, dec, type;
    /*
    + or - before number
    exactlly 2 decimal points
    comma separating the thousands

    2310.4567 -> 2,310.46
    2000 -> +2,000.00

    */

    num = Math.abs(num);
    num = num.toFixed(2);

    numSplit = num.split('.');

    int = numSplit[0];

    if (int.length > 3){
      int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
    }

    dec = numSplit[1];

    return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;

  };

  return {
    getInput: function () {
      return {
        type: document.querySelector(DOMstrings.inputType).value, //Will be either inc or exp
        description: document.querySelector(DOMstrings.inputDescription).value,
        value: parseFloat (document.querySelector(DOMstrings.inputValue).value)
      };
    },

    addListItem: function(obj, type){
      var html, newHtml, element;
      //create html string with placeholder text


      if (type === 'inc'){
        element = DOMstrings.incomeContainer;
        html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      } else if (type === 'exp'){
        element = DOMstrings.expensesContainer;
        html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">%percentage%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
      }

      
      //replace the placeholder texy with some actual data 
      newHtml = html.replace('%id%', obj.id);
      newHtml = newHtml.replace('%description%', obj.description);
      newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));


      //insert html into the dom
      document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

    },

    clearFields: function(){
      var fields, fieldsArr;

      fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue)

      var fieldsArr = Array.prototype.slice.call(fields);

      fieldsArr.forEach(function(current, index, array){
        current.value = "";

      })

      fieldsArr[0].focus();
    },

    displayMonth: function(){
      var now, year, month, months;

      now = new Date();
      //var christmas = new Date(2016, 11, 25);
      months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

      month = now.getMonth();
      year = now.getFullYear();
      document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;

    },

    displayBudget: function(obj){
      var type;
      obj.budget > 0 ? type = 'inc' : type = 'exp';

      document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
      document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
      document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
      

      if (obj.percentage > 0){
        document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
      } else {
        document.querySelector(DOMstrings.percentageLabel).textContent = '-';
      }
    },

    updatePercentages: function(itemsPercentageAndIds){
      var selector, percentageToUpdate;

      for (var i = 0; i < itemsPercentageAndIds.length; i ++){
        
        selector = '#exp-' + itemsPercentageAndIds[i].id + '>.right.clearfix>.item__percentage';

        if (itemsPercentageAndIds[i].percentage > 0){

          percentageToUpdate = String(itemsPercentageAndIds[i].percentage)+'%';
          
          document.querySelector(selector).textContent = percentageToUpdate;

        } else {
          document.querySelector(selector).textContent = '-';
        }

        
      }
      
    },

    deleteItem: function(itemID){
      var element = document.getElementById(itemID);
      element.parentNode.removeChild(element);
    },

    changedType: function(){

      var fields = document.querySelectorAll(
        DOMstrings.inputType + ',' + 
        DOMstrings.inputDescription + ',' +
        DOMstrings.inputValue
        );

      for (var i = 0; i < fields.length; i++){
        fields[i].classList.toggle('red-focus');
      };

      document.querySelector(DOMstrings.inputButton).classList.toggle('red');

    },

    getDOMstrings: function () {
      return DOMstrings;
    },

  };
})();





var controller = (function (budgetCtrl, UIctrl) {

  var setupEventListeners = function () {
    var DOM = UIctrl.getDOMstrings();
    document.querySelector(DOM.inputButton).addEventListener("click", ctrlAddItem);

    document.addEventListener("keypress", function (event) {
      if (event.key === "Enter" || event.code === "Enter") {
        ctrlAddItem();
      }
    });

    document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

    document.querySelector(DOM.inputType).addEventListener('change', UIctrl.changedType)
  };

  var updateBudget = function(){
    //1. calc budget
    budgetCtrl.calculateBudget();

    //2. return budget
    var budget = budgetCtrl.getBudget();

    //3. display budget in ui
    UIctrl.displayBudget(budget);
  };

  var updatePercentages = function(){
    var percentagesIDs;

    // 1. Calculate percentagesIDs
    budgetCtrl.calculatePercentages();

    // 2. Read percentagesIDs from the budget controller
    percentagesIDs = budgetCtrl.getPercentagesAndIDs();

    //3. Update the UI with the new percentagesIDs
    UIctrl.updatePercentages(percentagesIDs);

  };

  var ctrlAddItem = function () {
    var input, newItem;
    //1. Get field input data
    input = UIctrl.getInput();

    if (input.description !== "" && !isNaN(input.value) && input.value >0){
      // 2. Add the item to the budget controller
      newItem = budgetCtrl.addItem(input.type, input.description, input.value);
      
      // 3. Add the item to the UI
      UIController.addListItem(newItem, input.type);

      // 4. Clear the fields
      UIController.clearFields();

      // 5. Calculate and update the budget
      updateBudget();

      // 6. Calculate & update percentagesIDs
      updatePercentages();
    }
    
  };

  var ctrlDeleteItem = function(event){
    var itemID, splitID, type, ID;
   
    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

    if (itemID){
      splitID = itemID.split('-');
      type = splitID[0];
      ID = parseInt(splitID[1]);

      // 1. Delete the item from the data structure
      budgetCtrl.deleteItem(type, ID);

      // 2. Delete the item from the UI
      UIctrl.deleteItem(itemID);

      // 3. Update and show the new budget
      updateBudget();

      // 4. Calculate & update percentagesIDs
      updatePercentages();


    }
  };

  return {
    init: function(){
      console.log('Application has started.');
      UIctrl.displayMonth();
      UIctrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1
      });
      setupEventListeners();
    }
  };

})(budgetController, UIController);

controller.init();