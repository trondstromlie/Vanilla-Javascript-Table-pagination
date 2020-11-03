
// classes
class Add_to_table {

  constructor(options_obj) {
    // options_obj = { obj , table_id, nav_id , rows, sort_value, sort_direction, current}

    this.table = document.getElementById(options_obj.table) ;
    this.nav = options_obj.nav_id;
    this.default_n=options_obj.rows;

    let {sort_key, sort_direction} = options_obj;


    let current = +options_obj.current === "undefined"? options_obj.current : 0;

    let global_obj = options_obj.obj;
    let table_id = options_obj.table_id;
    populate_table_head(global_obj);
    let sorted;

    if((sort_key != null) && (sort_direction !=null)) {
      let mir_sort_direction = sort_direction === "desc" ? "asc" : "desc";

      sort_table(mir_sort_direction,sort_key);


    } else {

      sorted = sort(global_obj , +this.default_n);
      populate_table( this.table, sorted[0] );
      add_nav_pagination(sorted, +current);
    }


    // ====  public table methods

    // public method to opdate the table from url
    this.update_table = function (update_obj) {
      // rows,  current , sort_direction  , sort_key


      let mir_sort_direction = update_obj.sort_direction === "desc" ? "asc" : "desc";
      sorted = sort(global_obj , +update_obj.rows);

      sort_table(mir_sort_direction,update_obj.sort_key);
      add_nav_pagination(sorted, +update_obj.current);

    }

    // go to page number in table (etc from url)
    this.jump_to_page_in_table = function (n_page) {
        populate_table( this.table, sorted[n_page] );
        add_nav_pagination(sorted, n_page);

    }
    // rows pr page
    this.rows_pr_page = function(rows_pr_page) {
      sorted = sort(global_obj , rows_pr_page);
      populate_table( this.table, sorted[0]);
      add_nav_pagination(sorted, current);


    }

    this.delete_row = function(data_value, delete_dialog) {
      if(delete_dialog === false) {

        let this_object = global_obj.filter(item => item.name != data_value);
        global_obj = this_object;

        sorted = sort(global_obj , fetch_n_rows());
        populate_table( this.table, sorted[0]);
        add_nav_pagination(sorted, current);
      } else {
        // send to the delete function
        delete_row_function(data_value , table);
      }

    }

    // ====  private table functions

    // ====================================================
    // set the eventlisteners for number of rows pr page

    document.querySelector("#number_of_rows_pr_page").addEventListener("change", function(e) {

      sorted = sort(global_obj , +this.value);

      populate_table( table_id, sorted[0]);
      add_nav_pagination(sorted, 0);

      update_url(this.value, current  , sort_key, sort_direction)

    })

    // event listener for check or uncheck all in page on table
    document.getElementById("table_add_all_checkbox").addEventListener("change", function(e){
      let checkboxes = document.querySelector("#my_table").querySelectorAll("input[type=checkbox]");
      if(this.checked) {
        for(let checkbox of checkboxes) {
          checkbox.checked = true;
        }
      } else {
        for(let checkbox of checkboxes) {
          checkbox.checked = false;
        }
      }
    });

    // eventlistner for action button
    document.getElementById("action_btn").addEventListener("click", function(e) {
      // get value of the action type field
      let action = document.getElementById("action_field").value;
      if(action === "delete") {

        let checkboxes = document.querySelector("#my_table").querySelectorAll("input[type=checkbox]:checked");
          let leads_data_array = [];
          for(let checkbox of checkboxes) {
            leads_data_array.push(checkbox.getAttribute("data-value") );
          }
          // uncheck check all buttons
          document.getElementById("table_add_all_checkbox").checked = false;
          // send the array to the private delete function for confiramtion and deletion
          delete_row_function(leads_data_array);

      }

    });

    // fetch selected number of rows
    function fetch_n_rows() {
      return +document.querySelector("#number_of_rows_pr_page").value
    }


    // =========================================================================
    // function to populate the table head column names
    function populate_table_head(global_obj) {

      // first get all keys in the first array_of_users
      let table_head = document.querySelector("#thead");
      table_head.innerHTML = ""
      let row = table_head.insertRow();
      let th1 = document.createElement("th");
      th1.innerHTML = "-";
      row.appendChild(th1);

      for(let key in global_obj[0]) {
        // add the chevron down up, and make it hidden by default

        let th = document.createElement("th");
        // create the text div
        let div = document.createElement("div");
        div.classList.add("key-name")
        div.setAttribute("id", "table_key_"+key);
        div.setAttribute("data-sort", "asc");
        div.setAttribute("data-sortkey", key);
        div.innerHTML = key;
        th.appendChild(div);
        row.appendChild(th);

        // sett eventlistner


      }
      let keys = document.querySelectorAll(".key-name");

      for(let k = 0; k < keys.length; k++) {
        keys[k].addEventListener( "click", function(e) {
          sort_table(this.getAttribute("data-sort"), this.getAttribute("data-sortkey"), this.getAttribute("id"));
      })

      }

    }

    // ===================================================================================================
    // sort function sett sort by and edit the chevron for sort direction;

    function sort_table(sort_direction, sort_value) {
      sort_key = sort_value;
      sort_direction = sort_direction;
      console.log(sort_value)
      let button_id = "#table_key_"+ sort_value;
      let this_sort_value = sort_value;
      let this_sort_direction = sort_direction;

      if(sort_direction ==="desc") {
        document.querySelector(button_id).setAttribute("data-sort", "asc");


        let sorted_desc = global_obj.sort( function(a,b) {
          return (""+ b[this_sort_value]).localeCompare(a[this_sort_value]);
        })
        // make all other field button  sort-value "no"
        let sort_classes = document.querySelectorAll(".key-name");

        for(let button of sort_classes) {

          if(button.getAttribute("data-sortkey") != this_sort_value) {
            button.setAttribute("data-sort", "no");
          }
        }

        // update global values and build table
        global_obj = sorted_desc;
        sorted = sort(global_obj , fetch_n_rows());

        populate_table( table_id, sorted[+current]);
        add_nav_pagination(sorted, +current);
        update_url(fetch_n_rows(), +current , sort_value, sort_direction)
        // create a sort function make all other use a queryselect to sett all other fields to data-direction-no

      }
      else {

        document.querySelector(button_id).setAttribute("data-sort", "desc");

        let sorted_desc = global_obj.sort( function(a,b) {
          return (""+ a[this_sort_value]).localeCompare(b[this_sort_value]);
        })
        // make all other field button  sort-value "no"
        let sort_classes = document.querySelectorAll(".key-name");

        for(let button of sort_classes) {

          if(button.getAttribute("data-sortkey") != this_sort_value) {
            button.setAttribute("data-sort", "no");
          }
        }

        // update global values and build table
        global_obj = sorted_desc;
        sorted = sort(global_obj , fetch_n_rows());
        populate_table( table_id, sorted[+current]);
        add_nav_pagination(sorted, +current);
        update_url(fetch_n_rows(), +current , this_sort_value, sort_direction)
      }
    }
    // ====================================================================================================
    // private function to build the split table array ===================================================
      function sort(obj,  n) {
        if(obj.length < 0) {
          return NaN;
        }
        let split_array = [];
        let temp_array = [];

        for(let users of obj) {

          temp_array.push(users);

          if(temp_array.length === n) {

            split_array.push(temp_array);
            temp_array = [];
          }
        }
        if(temp_array.length > 0)  split_array.push(temp_array);

        return split_array;

      };

      // ===============================================================================================================
      // private function to populate the my_table and handle the delete rows button

      function populate_table(table, array_of_users) {

            if(typeof array_of_users === "undefined") {

              document.querySelector("#"+table_id+" #tbody").innerHTML = "<tr></tr>";
              return NaN;
            }

            document.querySelector("#"+table_id+" #tbody").innerHTML = "<tr></tr>"
            let this_table = document.querySelector("#"+table_id);
            for(let user of array_of_users) {
              let row =  this_table.insertRow();
                let cell1 = row.insertCell();
                cell1.classList.add("d-flex", "justify-content-start", "align-items-center")

                let first_div = document.createElement("div");
                first_div.innerHTML ='<input type="checkbox" data-value="'+user.Name+'">'
                cell1.appendChild(first_div);


                let second_div = document.createElement("div");
                second_div.classList.add("far", "fa-trash-alt","ml-3");
                second_div.setAttribute("id","delete_user_"+user.Name);
                second_div.setAttribute("data-value", user.Name);
                cell1.appendChild(second_div)



              for(let key in user) {

                let cell = row.insertCell();
                cell.innerHTML = user[key];
              }
            }
        let add_listner_id = document.querySelectorAll("[id^=delete_user_]");
        for(let listner of add_listner_id) {
          listner.addEventListener("click", function(e) {
            let this_data_value = [];

            this_data_value[0] = this.getAttribute("data-value");

            delete_row_function(this_data_value, this.table);


          })
        }
      }
      // =======================================================================================
      // deltete row function with bootstrap modal delete dialog ===============================
      function delete_row_function(this_data_values_array , table) {



        let this_ul = document.getElementById("delete_users");
        this_ul.innerHTML ="";
        for(let i = 0; i < this_data_values_array.length ; i++ ) {

          let this_li = document.createElement("li");
          this_li.classList.add("list-group-item", "delete-users");

          this_li.innerHTML = this_data_values_array[i]
          this_ul.appendChild(this_li);
        }
        // jquery to open the bootatrap modal
        $("#delete-dialog").modal("toggle");


        let confirm_delete = document.querySelector("#confirm_delete").addEventListener("click", function(e) {
          let confirmation_text = document.querySelector("#confirm_text");




            if(confirmation_text.value === "DELETE") {

              // use jquery to open the modal dialog
                    for(let user in this_data_values_array) {
                      // delete this element from the object

                      let x_obj = global_obj.filter(item => item.Name != this_data_values_array[user])
                      global_obj = x_obj;





                      let current_rows_pr_page = document.querySelector("#number_of_rows_pr_page").value;

                      let this_current = +current  ;
                      let this_sorted = sorted.length -1;

                      if((this_current === this_sorted) && (sorted[this_current].length === 1)) {

                        this_current = this_current -1};

                      if(((this_current +1)  >= 0 ) && ((this_sorted)  >= 0)) {
                        sorted = sort(global_obj , +current_rows_pr_page);
                        populate_table( table, sorted[this_current]);
                        add_nav_pagination(sorted, this_current);
                        update_url(fetch_n_rows(), this_current , sort_key, sort_direction)
                      }
                    }
                  // close the bootatrap modal
                  $("#delete-dialog").modal("toggle");

                  // empty the array
                  this_data_values_array = [];


            } else {
              // if text dont match change color on field and add error message
              confirmation_text.style.backgroundColor ="#ffdbf4";
            }

        });
        document.getElementById("confirm_text").value = ""

      }

      // navigation BAr  =====================================================================================
      // private add  nav pagination function
      function add_nav_pagination(sorted, this_current) {
        current = this_current;
        if(typeof sorted === "undefined") {

          nav.innerHTML = "";
          return NaN;
        }
        // first add the previous button if cuent is 0 make the button disabled
        let nav = document.querySelector("#pagination_ul");
        // reset the navbar
        nav.innerHTML = ""

              let prev_li = document.createElement("li");
              if(+this_current === 0 ) {
                prev_li.classList.add("page-item", "disabled");
                let prev_a = document.createElement("a");
                  prev_a.classList.add("page-link");
                  prev_a.innerHTML = "Previous";
                  prev_li.appendChild(prev_a);
                  nav.appendChild(prev_li);
              } else {
                prev_li.classList.add("page-item");
                let prev_a = document.createElement("a");
                  prev_a.classList.add("page-link");
                  if( this_current > 0 ) prev_a.setAttribute("data-item", this_current - 1)
                  prev_a.setAttribute("id", "nav_tab_pagination_item_prev");
                  prev_a.innerHTML = "Previous";
                  prev_li.appendChild(prev_a);
                  nav.appendChild(prev_li);
              }
              // add all number buttons
              for(let i = 0 ; i < sorted.length; i++) {
                let this_li = document.createElement("li");
                this_li.classList.add("page-item");

                if(i === +this_current) this_li.classList.add("active")

                let this_a = document.createElement("a");
                  this_a.classList.add("page-link");
                  this_a.setAttribute("data-item", i)
                  this_a.setAttribute("id", "nav_tab_pagination_item_"+i);
                  this_a.innerHTML = i+1;
                  this_li.appendChild(this_a);
                  nav.appendChild(this_li);
              }
              let last_li = document.createElement("li");
              last_li.classList.add("page-item");

              if((sorted.length-1) == (+this_current)  )  last_li.classList.add("disabled");
              let last_a = document.createElement("a");
                last_a.setAttribute("data-item", +current + 1)
                last_a.setAttribute("id", "nav_tab_pagination_item_next");
                last_a.classList.add("page-link");
                last_a.innerHTML = "Next";
                last_li.appendChild(last_a);
                nav.appendChild(last_li);

            // set eventlistner for nav bar
            let listen_for_nav_pagination = document.querySelectorAll("[id^=nav_tab_pagination_item_]");
              for(nav of listen_for_nav_pagination) {
                nav.addEventListener("click", function(e) {

                  populate_table( "#"+table_id, sorted[e.target.getAttribute("data-item")] );
                  add_nav_pagination(sorted, e.target.getAttribute("data-item"));

                  update_url(fetch_n_rows(), current , sort_key, sort_direction)

                });
              }
      }

      // private function tu update the url
      // function to update url
      function update_url(n_rows_pr_page, current_page , sort_key, sort_direction) {
        let this_sort_direction = sort_direction === "desc"? "asc":"desc";
        // build the querystring function
        function encodeQueryData(data) {
          const ret = [];
          for (let d in data)
            ret.push(encodeURIComponent(d) + '=' + encodeURIComponent(data[d]));
            return ret.join('&');
          }
      let data = { 'sort_key':sort_key, 'sort_direction': this_sort_direction, 'rows': n_rows_pr_page, 'table-page': current_page };
       let querystring = encodeQueryData(data);
       window.history.pushState('table', 'Table', window.location.pathname+'?'+querystring);

      }


    }
}

// end table class


// end on ready


let user_obj = [
  {
    Name:"Ingrid Bergman",Phone:"13456780"
  },
  {
    Name:"Clark Gable",Phone:"13456781"
  },
  {
    Name:"Sidney Poitier",Phone:"13456782"
  },
  {
    Name:"Daniel Day-Lewis",Phone:"13456783"
  },
  {
    Name:"Meryl Streep",Phone:"13456784"
  },
  {
    Name:"Humphrey Bogart",Phone:"13456785"
  },
  {
    Name:"Katharine Hepburn",Phone:"13456786"
  },
  {
    Name:"Denzel Washington",Phone:"13456787"
  },
  {
    Name:"Marlon Brando",Phone:"13456788"
  },
  {
    Name:"Jack Nicholson",Phone:"13456789"
  },
  {
    Name:"Robert De Niro",Phone:"13456790"
  },
];

// to catch the url querystring  you must do it before initalizing the class...
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

let update_url_obj = {
              obj:user_obj,
              table_id:"my_table",
              nav_id: "test_nav",
              rows:+urlParams.get("rows"),
              current:+urlParams.get("table-page"),
              sort_direction:urlParams.get("sort_direction"),
              sort_key:urlParams.get("sort_key")
            };

let options = {
              obj:user_obj,
              table_id:"my_table",
              nav_id: "test_nav",
              rows: "2",
              sort_key: null,
              sort_direction: null,
              };

// if url parameters are set initialize the table class from the url values
if((update_url_obj.rows != 0) && (update_url_obj.current != 0)) {
  options = update_url_obj;

}



// else use the defalut values
let x = new Add_to_table(options)





$(document).ready( function() {
console.log("Welcome to the Table class developed my stromedia technology, try out some of the methods by typing console.log(x) here in the console.");
console.log("F.ex Write x.delete_row(['Ingrid Bergman'], true); to delete this row with the delete dialog, write false to skip the dialog.")
console.log("Send an email to mybestlabs@gmail.com if you have any questions :) ")

});
