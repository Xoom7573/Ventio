app.get("/getState", (req, res) => {
    res.send(o);
});

app.get("/updateState/:type/:value", (req, res) => {
    let type = req.params.type;
    let value = Number(req.params.value);
    let reply;

    o[type] = value;
    fs.writeFile("state.json", JSON.stringify(o), () => {});
    reply = { status: "succes", update: o };

    console.log(type);
    res.send(reply);
});
