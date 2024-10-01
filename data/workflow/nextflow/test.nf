process foo {
  input:
  val x

  """
  echo $x 
  sleep 100
  """
}

workflow {
  foo("test...")
}