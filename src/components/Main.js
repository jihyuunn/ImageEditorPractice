import React, {useState, useRef, useEffect} from 'react'
import styled from 'styled-components'

const Main = () => {
    const storage = window.firebase.storage();
    const allInputs = {imgUrl: ''}
    const [imageAsFile, setImageAsFile] = useState('')
    const [imageAsUrl, setImageAsUrl] = useState(allInputs)
    const [load, setLoad] = useState(false)
    const canvas = useRef()
    const image = useRef()
    let ctx
    useEffect(() => {
        console.log(canvas.current)
        ctx = canvas.current.getContext("2d")
        
    }, [canvas])
    const [file, setFile] = useState('')
    function fileHandler(e) {
        setImageAsFile(e.target.files[0])
        const reader = new FileReader();
        reader.onloadend = function(event) {
            console.log(event.target.result)
            setFile(reader.result)
            ctx.drawImage(file, 0, 0)
            ctx.front = "40px Courier"
        }
        reader.readAsDataURL(e.target.files[0])
        setFile(reader.result)
        setLoad(true)
        // image.current.onload = () => {
        //     ctx.drawImage(file, 0, 0)
        //     ctx.front = "40px Courier"
        //     ctx.fillText(text, 210, 75)
        // }
    }
    useEffect(() => {
        console.log(file)
    }, [load])

    const firebaseHandler = e => {
        e.preventDefault();
        const uploadTask = storage.ref(`/images/${imageAsFile.name}`).put(imageAsFile);
        uploadTask.on('state_changed', 
        (snapShot) => {
          //takes a snap shot of the process as it is happening
          console.log(snapShot)
        }, (err) => {
          //catches the errors
          console.log(err)
        }, () => {
          // gets the functions from storage refences the image storage in firebase by the children
          // gets the download url then sets the image from firebase as the value for the imgUrl key:
          storage.ref('images').child(imageAsFile.name).getDownloadURL()
           .then(fireBaseUrl => {
             setImageAsUrl(prevObject => ({...prevObject, imgUrl: fireBaseUrl}))
           })
        })
    }
    return (
        <div>
            <form onSubmit={firebaseHandler}>
                <label>
                    <input type='file' onChange={fileHandler}/>
                </label>
                <input type='submit' value='submit' />
            </form>
            <div>
                <canvas ref={canvas} width={600} height={400} />
                {load ? <img ref={image} src={file} alt="uploadedImg"/>:null}
            </div>
        </div>
    )
}

export default Main

