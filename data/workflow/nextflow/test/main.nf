process foo {
  input:
  val x

  """
  echo $x 
  sleep 3600
  """
}

workflow {
  foo("test...")
}