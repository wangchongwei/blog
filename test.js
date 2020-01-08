function findMax(arr) {
    console.log(arr);
    let max = 0;
    if(arr.length === 0) {
        return max;
    } else {
        max = arr[0] > max ? arr[0] : max;
        arr.splice(0, 1);
        return findMax(arr);
    }
}

var arr = [1, 2, 3, 4, 5];
findMax(arr);

